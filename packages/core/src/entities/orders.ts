import { count, eq, sum } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { array, InferInput, minLength, minSize, omit, pipe, safeParse } from "valibot";
import { db } from "../drizzle/sql";
import { AddressSelect } from "../drizzle/sql/schema";
import { orders } from "../drizzle/sql/schemas/orders";
import { Validator } from "../validator";

export module Orders {
  export const CreateSchema = createInsertSchema(orders);
  export const UpdateSchema = omit(
    createInsertSchema(orders, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.orders.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    dest: true,
    org: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Orders.findById>>>;

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
    const isValid = safeParse(Orders.UpdateSchema, data.id);
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

  export const getHotspotByRegions = async (region_ids: InferInput<typeof MinOneRegionSchema>, tsx = db) => {
    const isValid = safeParse(MinOneRegionSchema, region_ids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const orders_by_region: Record<string, Orders.Info[]> = {};
    const _orders = (await Promise.all(region_ids.map((id) => findByRegionId(id)))).flat();
    for (const order of _orders) {
      if (!order) continue;
      if (!order.region_id) continue;
      if (!orders_by_region[order.region_id]) orders_by_region[order.region_id] = [];
      orders_by_region[order.region_id].push(order);
    }

    const region_with_the_most_orders = Object.keys(orders_by_region).reduce((a, b) => {
      return orders_by_region[a].length > orders_by_region[b].length ? a : b;
    }, region_ids[0]);

    const _orders2 = orders_by_region[region_with_the_most_orders];

    // get the lat lang of the closest origin

    const origins: AddressSelect[] = [];

    for (const order of _orders2) {
      if (!order.origin_id) continue;
      origins.push(order.origin);
    }

    // create an area of lat lang of origins which are in the radius of a number.

    const radius = 10; // km

    const hotspots: Record<string, { latlang: [number, number]; address: string }> = {};

    for (const origin of origins) {
      const lat = Number(origin.latitude);
      const lng = Number(origin.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
      const distance = Math.sqrt(Math.pow(lat - lat, 2) + Math.pow(lng - lng, 2));
      if (distance > radius) continue;
      // save the lat lang of the origin
      hotspots[origin.id] = {
        latlang: [lat, lng],
        address: origin.streetname + " " + origin.zipcode + " " + origin.country,
      };
    }

    return hotspots;
  };
}
