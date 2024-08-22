import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, pipe, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { organizations } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Organizations {
  export const CreateSchema = createInsertSchema(organizations);
  export const UpdateSchema = omit(
    createInsertSchema(organizations, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.organizations.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    employees: {
      with: {},
    },
    user: true,
  };

  export const create = async () => {};

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(pipe(string(), Validator.Cuid2Schema), id);
    if (!isValid) throw new Error("Invalid id");
    return tsx.query.organizations.findFirst({
      where: (fields, ops) => ops.eq(fields.id, id),
      with: _with,
    });
  };

  export const findByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.organizations.findMany({
      where: (fields, ops) => ops.eq(fields.ownerId, isValid.output),
      with: _with,
    });
  };

  export const lastCreatedByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.organizations.findFirst({
      where: (fields, ops) => ops.eq(fields.ownerId, isValid.output),
      orderBy: [desc(organizations.createdAt)],
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Organizations.UpdateSchema, data.id);
    if (!isValid.success) throw isValid.issues;
    return tsx.update(organizations).set(isValid.output).where(eq(organizations.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(pipe(string(), Validator.Cuid2Schema), id);
    if (!isValid.success) throw isValid.issues;
    return db.delete(organizations).where(eq(organizations.id, isValid.output)).returning();
  };
}
