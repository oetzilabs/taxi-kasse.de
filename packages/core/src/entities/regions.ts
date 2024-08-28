import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, pipe, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { regions } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Regions {
  export const CreateSchema = createInsertSchema(regions);
  export const UpdateSchema = omit(
    createInsertSchema(regions, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.regions.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    employees: {
      with: {},
    },
    user: true,
  };
  export type Info = NonNullable<Awaited<ReturnType<typeof Regions.findById>>>;

  export const create = async (data: InferInput<typeof Regions.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Regions.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(regions).values(isValid.output).returning();
    const org = await Regions.findById(created.id);
    return org!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(pipe(string(), Validator.Cuid2Schema), id);
    if (!isValid) throw new Error("Invalid id");
    return tsx.query.regions.findFirst({
      where: (fields, ops) => ops.eq(fields.id, id),
      with: _with,
    });
  };

  export const findByOrganizationId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.organization_regions.findMany({
      where: (fields, ops) => ops.eq(fields.organization_id, isValid.output),
      with: {
        organization: true,
        region: true,
      },
    });
  };

  export const update = async (data: InferInput<typeof UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Regions.UpdateSchema, data.id);
    if (!isValid.success) throw isValid.issues;
    return tsx.update(regions).set(isValid.output).where(eq(regions.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return db.delete(regions).where(eq(regions.id, isValid.output)).returning();
  };
}
