import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, safeParse } from "valibot";
import { db } from "../drizzle/sql";
import { vehicles } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Vehicles {
  export const CreateSchema = createInsertSchema(vehicles);
  export const UpdateSchema = omit(
    createInsertSchema(vehicles, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.vehicles.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    rides: {
      with: {
        org: {
          with: {
            user: true,
            employees: {
              with: {
                user: true,
              },
            },
          },
        },
        user: {
          with: {
            orgs: {
              with: {
                organization: true,
              },
            },
          },
        },
      },
    },
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Vehicles.findById>>>;

  export const create = async (data: InferInput<typeof Vehicles.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Vehicles.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(vehicles).values(isValid.output).returning();
    const vehicle = await Vehicles.findById(created.id)!;
    return vehicle;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.vehicles.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Vehicles.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Vehicles.UpdateSchema, data.id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(vehicles).set(isValid.output).where(eq(vehicles.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(vehicles).where(eq(vehicles.id, isValid.output)).returning();
  };
}
