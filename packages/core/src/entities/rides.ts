import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { InferInput, omit, safeParse } from "valibot";
import { db } from "../drizzle/sql";
import { rides } from "../drizzle/sql/schemas/rides";
import { Validator } from "../validator";

export module Rides {
  export const CreateSchema = createInsertSchema(rides);
  export const UpdateSchema = omit(
    createInsertSchema(rides, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.rides.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    user: {
      with: {
        orgs: {
          with: {
            organization: true,
          },
        },
      },
    },
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
    vehicle: {
      with: {
        owner: true,
      },
    },
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Rides.findById>>>;

  export const create = async (data: InferInput<typeof Rides.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Rides.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(rides).values(isValid.output).returning();
    const ride = await Rides.findById(created.id);
    return ride!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.rides.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.rides.findMany({
      where: (fields, ops) => ops.eq(fields.user_id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Rides.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Rides.UpdateSchema, data.id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(rides).set(isValid.output).where(eq(rides.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(rides).where(eq(rides.id, isValid.output)).returning();
  };
}
