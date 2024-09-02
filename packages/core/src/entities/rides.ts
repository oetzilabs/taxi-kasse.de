import { count, eq, sum } from "drizzle-orm";
import { array, date, InferInput, intersect, object, picklist, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { ride_added_by, ride_status, rides, RideSelect } from "../drizzle/sql/schemas/rides";
import { Validator } from "../validator";

export module Rides {
  export const CreateSchema = array(
    object({
      added_by: picklist(ride_added_by.enumValues),
      user_id: Validator.Cuid2Schema,
      org_id: Validator.Cuid2Schema,
      income: string(),
      distance: string(),
      vehicle_id: Validator.Cuid2Schema,
      rating: string(),
      status: picklist(ride_status.enumValues),
      startedAt: date(),
      endedAt: date(),
    }),
  );
  export const UpdateSchema = intersect([CreateSchema.item, object({ id: Validator.Cuid2Schema })]);

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
    routes: {
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
      with: {
        segments: {
          with: {
            points: true,
          },
          orderBy: (fields, ops) => ops.desc(fields.createdAt),
        },
        waypoints: {
          orderBy: (fields, ops) => ops.desc(fields.createdAt),
        },
      },
    },
  };

  export type Create = InferInput<typeof CreateSchema>;

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
    const rides = await tsx.query.rides.findMany({
      where: (fields, ops) => ops.eq(fields.user_id, isValid.output),
      with: _with,
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });
    type X = (typeof rides)[number]["routes"];

    return rides;
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

  export const countByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const result = await tsx
      .select({ count: count(rides.id) })
      .from(rides)
      .where(eq(rides.user_id, isValid.output));

    return result[0].count;
  };

  export const sumByUserId = async (
    id: InferInput<typeof Validator.Cuid2Schema>,
    field: keyof RideSelect,
    tsx = db,
  ) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const result = await tsx
      .select({ sum: sum(rides[field]) })
      .from(rides)
      .where(eq(rides.user_id, isValid.output));

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };
}
