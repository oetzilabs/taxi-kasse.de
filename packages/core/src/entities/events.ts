import { eq, sum } from "drizzle-orm";
import {
  array,
  date,
  InferInput,
  intersect,
  minLength,
  nullable,
  object,
  omit,
  partial,
  pipe,
  safeParse,
  string,
} from "valibot";
import { db } from "../drizzle/sql";
import { AddressSelect } from "../drizzle/sql/schema";
import { events } from "../drizzle/sql/schemas/events";
import { Helper } from "../helper-functions";
import { Validator } from "../validator";

export module Events {
  export const CreateSchema = object({
    name: string(),
    description: string(),
    contentHTML: string(),
    contentText: string(),
    region_id: nullable(Validator.Cuid2Schema),
    origin_id: nullable(Validator.Cuid2Schema),
    created_by: Validator.Cuid2Schema,
    date: string(),
    time: string(),
  });

  export const Create = omit(Events.CreateSchema, ["created_by"]);

  export const UpdateSchema = intersect([partial(Events.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.events.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    createdBy: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Events.findById>>>;

  export type HotspotInfo = NonNullable<Awaited<ReturnType<typeof Events.getEventsByRegions>>>[number];

  export const create = async (data: InferInput<typeof Events.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Events.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(events).values(isValid.output).returning();
    const order = await Events.findById(created.id);
    return order!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.events.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Events.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Events.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [updated] = await tsx.update(events).set(isValid.output).where(eq(events.id, isValid.output.id)).returning();
    const u = await findById(updated.id, tsx);
    return u!;
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(events).where(eq(events.id, isValid.output)).returning();
  };

  export const findByRegionId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.events.findMany({
      where: (fields, ops) => ops.eq(fields.region_id, isValid.output),
      with: _with,
    });
  };

  const MinOneRegionSchema = pipe(array(Validator.Cuid2Schema), minLength(1));

  export const getEventsByRegions = async (region_ids: InferInput<typeof MinOneRegionSchema>, tsx = db) => {
    const isValid = safeParse(MinOneRegionSchema, region_ids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const orders_by_region: Map<string, Events.Info[]> = new Map();
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
      if (_orders.length < 5) continue; // we are skipping any region with less than 5 events
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
      if (!order.origin) continue;
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
    const events = await tsx.query.events.findMany({
      with: _with,
    });
    return events;
  };

  export const allNonDeleted = async (tsx = db) => {
    const events = await tsx.query.events.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      orderBy(fields, ops) {
        return [ops.desc(fields.createdAt), ops.desc(fields.date)];
      },
      with: _with,
    });
    return events;
  };
}
