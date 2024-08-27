import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, safeParse } from "valibot";
import { db } from "../drizzle/sql";
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
    const ride = await Orders.findById(created.id);
    return ride!;
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
}
