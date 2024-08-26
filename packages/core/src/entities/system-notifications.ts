import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, safeParse } from "valibot";
import { db } from "../drizzle/sql";
import { system_notifications } from "../drizzle/sql/schemas/system-notifications";
import { Validator } from "../validator";

export module SystemNotifications {
  export const CreateSchema = createInsertSchema(system_notifications);
  export const UpdateSchema = omit(
    createInsertSchema(system_notifications, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.system_notifications.findFirst>[0]>["with"];
  export const _with: WithOptions = {};

  export type Info = NonNullable<Awaited<ReturnType<typeof SystemNotifications.findById>>>;

  export const create = async (data: InferInput<typeof SystemNotifications.CreateSchema>, tsx = db) => {
    const isValid = safeParse(SystemNotifications.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(system_notifications).values(isValid.output).returning();
    const ride = await SystemNotifications.findById(created.id);
    return ride!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return db.query.system_notifications.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof SystemNotifications.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(SystemNotifications.UpdateSchema, data.id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx
      .update(system_notifications)
      .set(isValid.output)
      .where(eq(system_notifications.id, isValid.output.id))
      .returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return db.delete(system_notifications).where(eq(system_notifications.id, isValid.output)).returning();
  };
}