import { eq, sum } from "drizzle-orm";
import {
  array,
  InferInput,
  InferOutput,
  intersect,
  minLength,
  number,
  object,
  partial,
  pipe,
  safeParse,
  string,
} from "valibot";
import { db } from "../drizzle/sql";
import { AddressSelect } from "../drizzle/sql/schema";
import { orders } from "../drizzle/sql/schemas/orders";
import { Helper } from "../helper-functions";
import { Validator } from "../validator";

export module Orders {
  export const CreateSchema = object({
    destination_id: Validator.Cuid2Schema,
    origin_id: Validator.Cuid2Schema,
    organization_id: Validator.Cuid2Schema,
    estimated_cost: string(),
    driver_id: Validator.Cuid2Schema,
    region_id: Validator.Cuid2Schema,
    customer_id: Validator.Cuid2Schema,
  });

  export const UpdateSchema = intersect([partial(Orders.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.orders.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    dest: true,
    org: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Orders.findById>>>;

  export type HotspotInfo = NonNullable<Awaited<ReturnType<typeof Orders.getHotspotsByRegions>>>[number];

  export const create = async (data: InferInput<typeof Orders.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Orders.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(orders).values(isValid.output).returning();
    const order = await Orders.findById(created.id);
    return order!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.orders.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findAllByOrganizationId = async (destinationId: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, destinationId);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.orders.findMany({
      where: (fields, ops) => ops.eq(fields.organization_id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Orders.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Orders.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(orders).set(isValid.output).where(eq(orders.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(orders).where(eq(orders.id, isValid.output)).returning();
  };

  export const sumByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const result = await tsx
      .select({ sum: sum(orders.estimated_cost) })
      .from(orders)
      .where(eq(orders.driver_id, isValid.output));

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };

  export const findByRegionId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.orders.findMany({
      where: (fields, ops) => ops.eq(fields.region_id, isValid.output),
      with: _with,
    });
  };

  const MinOneRegionSchema = pipe(array(Validator.Cuid2Schema), minLength(1));

  export const getHotspotsByRegions = async (region_ids: InferInput<typeof MinOneRegionSchema>, tsx = db) => {
    const isValid = safeParse(MinOneRegionSchema, region_ids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const orders_by_region: Map<string, Orders.Info[]> = new Map();
    const _orders = (await Promise.all(region_ids.map((id) => findByRegionId(id, tsx)))).flat();
    for (const order of _orders) {
      if (!order) continue;
      if (!order.region_id) continue;
      if (!orders_by_region.has(order.region_id)) orders_by_region.set(order.region_id, []);
      const orders_by_region_id = orders_by_region.get(order.region_id)!;
      orders_by_region_id.push(order);
      orders_by_region.set(order.region_id, orders_by_region_id);
    }

    if (orders_by_region.size === 0) return [];

    let region_with_the_most_orders: string | undefined = undefined;
    // rework that using a standart for loop:
    for (const [region_id, _orders] of orders_by_region) {
      if (!region_with_the_most_orders) {
        region_with_the_most_orders = region_id;
        continue;
      }
      if (_orders.length < 5) continue; // we are skipping any region with less than 5 orders
      if (orders_by_region.get(region_with_the_most_orders)!.length > orders_by_region.get(region_id)!.length) {
        region_with_the_most_orders = region_id;
      }
    }

    if (!region_with_the_most_orders) return [];

    const _orders2 = orders_by_region.get(region_with_the_most_orders);

    if (!_orders2) return [];

    const origins: AddressSelect[] = [];

    for (const order of _orders2) {
      if (!order.origin_id) continue;
      origins.push(order.origin);
    }
    const lat = Number(origins[0].latitude);
    const lng = Number(origins[0].longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return [];
    const radius = 2; // km

    const hs: Map<string, { lat: number; lng: number; address: string }> = new Map();

    for (const origin of origins.slice(0, 5)) {
      hs.set(origin.id, {
        address: origin.streetname + " " + origin.zipcode + " " + origin.country,
        lat: Number(origin.latitude),
        lng: Number(origin.longitude),
      });
    }

    const list_of_points = Array.from(hs.values());
    const { lat: clat, lng: clng } = Helper.calculateCentroid(list_of_points);
    const valid_subsets = Helper.findValidSubsets(list_of_points, clat, clng, radius);

    // !TODO: We need to gather the address of the centerpoint of the hotspot
    return valid_subsets;
  };

  export const all = async (tsx = db) => {
    const orders = await tsx.query.orders.findMany({
      with: _with,
    });
    return orders;
  };

  export const allNonDeleted = async (tsx = db) => {
    const orders = await tsx.query.orders.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      with: _with,
    });
    return orders;
  };
}
