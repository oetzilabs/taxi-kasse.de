import dayjs from "dayjs";
import { and, count, eq, gte, isNull, lte, sum } from "drizzle-orm";
import {
  array,
  date,
  InferInput,
  intersect,
  number,
  object,
  partial,
  picklist,
  safeParse,
  string,
  tuple,
} from "valibot";
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
  export const UpdateSchema = intersect([partial(CreateSchema.item), object({ id: Validator.Cuid2Schema })]);

  export const UpdateRoutesSchema = object({
    id: Validator.Cuid2Schema,
    waypoints: array(tuple([number(), number()])),
  });

  export const StatusSchema = picklist(ride_status.enumValues);

  export type WithOptions = NonNullable<NonNullable<Parameters<typeof db.query.rides.findFirst>[0]>["with"]>;
  export const _with: WithOptions = {
    user: {
      with: {
        orgs: {
          with: {
            user: true,
            organization: {
              with: {
                owner: true,
                employees: true,
                regions: true,
              },
            },
          },
        },
      },
    },
    company: {
      with: {
        owner: true,
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
        model: true,
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
      with: {
        ...Rides._with,
        vehicle: {
          with: {
            owner: true,
            model: true,
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
      },
    });
  };

  export const findByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const rides = await tsx.query.rides.findMany({
      where: (fields, ops) => ops.and(ops.eq(fields.user_id, isValid.output), ops.isNull(fields.deletedAt)),
      with: {
        ...Rides._with,
        vehicle: {
          with: {
            owner: true,
            model: true,
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
      },
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });

    return rides;
  };

  export const update = async (data: InferInput<typeof Rides.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Rides.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx
      .update(rides)
      .set({ ...isValid.output, updatedAt: new Date() })
      .where(eq(rides.id, isValid.output.id))
      .returning();
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
      .where(and(eq(rides.user_id, isValid.output), isNull(rides.deletedAt)));

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
      .where(and(eq(rides.user_id, isValid.output), isNull(rides.deletedAt)));

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };

  export const sumByUserIdForThisMonth = async (
    id: InferInput<typeof Validator.Cuid2Schema>,
    field: keyof RideSelect,
    tsx = db,
  ) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const startDate = dayjs().startOf("month").toDate();
    const endDate = dayjs().endOf("month").toDate();
    const result = await tsx
      .select({ sum: sum(rides[field]) })
      .from(rides)
      .where(
        and(
          eq(rides.user_id, isValid.output),
          gte(rides.startedAt, startDate),
          lte(rides.endedAt, endDate),
          isNull(rides.deletedAt),
        ),
      );

    if (result.length === 0) return 0;

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };

  export const markDeleted = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx
      .update(rides)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(rides.id, isValid.output))
      .returning();
  };

  export const updateRoutes = async (data: InferInput<typeof Rides.UpdateRoutesSchema>, tsx = db) => {
    const isValid = safeParse(Rides.UpdateRoutesSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    // compare already existing routes from the array of Lat,Lng if the origin and destination are the same,
    // then update the existing route
    // if they dont exist, create a new route,

    const newRoutes = [];

    for (const [lat, lng] of isValid.output.waypoints) {
    }

    const updatedRide = await findById(isValid.output.id, tsx);
    return updatedRide!;
  };

  export const findManyById = async (rids: Array<InferInput<typeof Validator.Cuid2Schema>>) => {
    const isValid = safeParse(array(Validator.Cuid2Schema), rids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const ridesFound = await db.query.rides.findMany({
      where: (fields, ops) => ops.and(ops.inArray(fields.id, isValid.output)),
      with: {
        ...Rides._with,
        vehicle: {
          with: {
            owner: true,
            model: true,
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
      },
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });

    return ridesFound;
  };

  export const markDeletedBulk = async (rids: Array<InferInput<typeof Validator.Cuid2Schema>>) => {
    return db.transaction(async (tsx) => {
      const isValid = safeParse(array(Validator.Cuid2Schema), rids);
      if (!isValid.success) {
        throw isValid.issues;
      }
      const ridesToDelete = await findManyById(isValid.output);

      if (ridesToDelete.length === 0) return [];

      for (const ride of ridesToDelete) {
        await tsx.update(rides).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(rides.id, ride.id));
      }

      return ridesToDelete;
    });
  };

  export const all = async (tsx = db) => {
    const rides = await tsx.query.rides.findMany({
      with: {
        ...Rides._with,
        vehicle: {
          with: {
            owner: true,
            model: true,
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
      },
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });
    return rides;
  };
  export const allNonDeleted = async (tsx = db) => {
    const rides = await tsx.query.rides.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      with: {
        ...Rides._with,
        vehicle: {
          with: {
            owner: true,
            model: true,
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
      },
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });
    return rides;
  };

  export const sumAllNonDeleted = async (field: keyof RideSelect, tsx = db) => {
    const result = await tsx
      .select({ sum: sum(rides[field]) })
      .from(rides)
      .where(isNull(rides.deletedAt));

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };

  export const sumAllNonDeletedThisMonth = async (field: keyof RideSelect, tsx = db) => {
    const startDate = dayjs().startOf("month").toDate();
    const endDate = dayjs().endOf("month").toDate();
    const result = await tsx
      .select({ sum: sum(rides[field]) })
      .from(rides)
      .where(and(gte(rides.startedAt, startDate), lte(rides.endedAt, endDate), isNull(rides.deletedAt)));

    if (result.length === 0) return 0;

    const _sum = result[0].sum;
    if (_sum === null) return 0;
    const __sum = Number(_sum);
    if (Number.isNaN(__sum)) return 0;
    return __sum;
  };

  export const checkIfRidesAreOwnedByUser = async (rids: Array<InferInput<typeof Validator.Cuid2Schema>>) => {
    const isValid = safeParse(array(Validator.Cuid2Schema), rids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const ridesFound = await db.query.rides.findMany({
      where: (fields, ops) => ops.and(ops.inArray(fields.id, isValid.output)),
      with: {
        user: {
          with: {
            orgs: {
              with: {
                user: true,
                organization: {
                  with: {
                    owner: true,
                    employees: true,
                    regions: true,
                  },
                },
              },
            },
          },
        },
        company: {
          with: {
            owner: true,
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
            model: true,
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
      },
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    });
    return ridesFound;
  };
}
