import { eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProfileSelect, day_entries, profiles, users } from "../drizzle/sql/schema";
import dayjs from "dayjs";

export * as User from "./users";

export const create = z
  .function(
    z.tuple([
      createInsertSchema(users),
      createInsertSchema(profiles).omit({
        userId: true,
      }),
    ])
  )
  .implement(async (userInput, profileInput) => {
    const [x] = await db.insert(users).values(userInput).returning();
    const [y] = await db
      .insert(profiles)
      .values({ ...profileInput, userId: x.id })
      .returning();
    return {
      ...x,
      profile: y,
    };
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${users.id})`,
    })
    .from(users);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      profile: true,
      company: true,
      day_entries: true,
    },
  });
});

export const findByEmail = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.email, input),
    with: {
      profile: true,
      company: true,
    },
  });
});

export const setCompany = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (userId, companyId) => {
    return update({ id: userId, companyId });
  });

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.users.findMany({
    with: {
      profile: true,
      company: true,
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(users)
        .deepPartial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    return db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, input.id))
      .returning();
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const getCompanyData = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const cData = await db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      company: true,
      // calendar: true,
    },
  });

  return cData;
});

export const statistics = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    ])
  )
  .implement(async (id, range) => {
    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) =>
            operations.and(operations.gte(day_entries.date, range.from), operations.lte(day_entries.date, range.to)),
          orderBy: (fields, operators) => operators.asc(fields.date),
        },
      },
    });
    type NEntries = NonNullable<typeof cData>;
    if (!cData) {
      return [] as NEntries["day_entries"];
    }
    return cData.day_entries;
  });
export const calendar = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.string().uuid(),
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    ])
  )
  .implement(async (id, companyId, range) => {
    const userWithCompany = await db.query.users.findFirst({
      where: (users, operations) =>
        operations.and(operations.eq(users.id, id), operations.eq(users.companyId, companyId)),
      with: {
        company: true,
      },
    });
    if (!userWithCompany) throw new Error("User not found");
    if (!userWithCompany.companyId) throw new Error("User has no company");

    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) =>
            operations.and(
              operations.gte(day_entries.date, range.from),
              operations.lte(day_entries.date, range.to),
              operations.eq(day_entries.deletedAt, isNull(day_entries.deletedAt)),
              operations.eq(day_entries.companyId, userWithCompany.companyId!)
            ),
          orderBy: (fields, operators) => operators.asc(fields.date),
        },
      },
    });
    type NEntries = NonNullable<typeof cData>;
    if (!cData) {
      return [] as NEntries["day_entries"];
    }
    return cData.day_entries;
  });

export const dayEntry = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
      }),
    ])
  )
  .implement(async (id, input) => {
    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) => operations.eq(day_entries.id, input.id),
        },
      },
    });
    if (!cData) {
      return null;
    }
    if (!cData.companyId) {
      return null;
    }
    const existsX = await db.query.day_entries.findFirst({
      where: (day_entries, operations) =>
        operations.and(
          operations.eq(day_entries.id, input.id),
          operations.eq(day_entries.ownerId, id),
          operations.eq(day_entries.companyId, cData.companyId!)
        ),
    });
    if (!existsX) {
      throw new Error("Day entry does not exist");
    }
    return existsX;
  });

export const createDayEntry = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        date: z.date(),
        total_distance: z.number(),
        driven_distance: z.number(),
        tour_count: z.number(),
        cash: z.number(),
      }),
    ])
  )
  .implement(async (id, input) => {
    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) => operations.eq(day_entries.date, input.date),
        },
      },
    });
    if (!cData) {
      return null;
    }
    if (!cData.companyId) {
      return null;
    }
    const existsX = await db.query.day_entries.findFirst({
      where: (day_entries, operations) =>
        operations.and(
          operations.lte(day_entries.date, dayjs(input.date).endOf("day").toDate()),
          operations.gte(day_entries.date, dayjs(input.date).startOf("day").toDate()),
          operations.eq(day_entries.ownerId, id),
          operations.eq(day_entries.deletedAt, isNull(day_entries.deletedAt)),
          operations.eq(day_entries.companyId, cData.companyId!)
        ),
    });
    if (existsX) {
      throw new Error("Day entry already exists");
    }
    const [x] = await db
      .insert(day_entries)
      .values({
        ownerId: id,
        cash: input.cash,
        date: input.date,
        companyId: cData.companyId,
        driven_distance: input.driven_distance,
        total_distance: input.total_distance,
        tour_count: input.tour_count,
      })
      .returning();
    return x;
  });

export const updateDayEntry = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
        total_distance: z.number(),
        driven_distance: z.number(),
        tour_count: z.number(),
        cash: z.number(),
      }),
    ])
  )
  .implement(async (id, input) => {
    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) => operations.eq(day_entries.id, input.id),
        },
      },
    });
    if (!cData) {
      return null;
    }
    if (!cData.companyId) {
      return null;
    }
    const existsX = await db.query.day_entries.findFirst({
      where: (day_entries, operations) =>
        operations.and(
          operations.eq(day_entries.id, input.id),
          operations.eq(day_entries.ownerId, id),
          operations.eq(day_entries.companyId, cData.companyId!)
        ),
    });
    if (!existsX) {
      throw new Error("Day entry does not exist");
    }
    const [x] = await db
      .update(day_entries)
      .set({
        cash: input.cash,
        driven_distance: input.driven_distance,
        total_distance: input.total_distance,
        tour_count: input.tour_count,
      })
      .where(eq(day_entries.id, existsX.id))
      .returning();
    return x;
  });

export const deleteDayEntry = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
      }),
    ])
  )
  .implement(async (id, input) => {
    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) => operations.eq(day_entries.id, input.id),
        },
      },
    });
    if (!cData) {
      return null;
    }
    if (!cData.companyId) {
      return null;
    }
    const existsX = await db.query.day_entries.findFirst({
      where: (day_entries, operations) =>
        operations.and(
          operations.eq(day_entries.id, input.id),
          operations.eq(day_entries.ownerId, id),
          operations.eq(day_entries.companyId, cData.companyId!)
        ),
    });
    if (!existsX) {
      throw new Error("Day entry does not exist");
    }
    const [x] = await db
      .update(day_entries)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(day_entries.id, existsX.id))
      .returning();
    return x;
  });

export const getDayEntriesByRange = z
  .function(
    z.tuple([
      z.string().uuid(),
      z
        .object({
          from: z.date(),
          to: z.date(),
        })
        .or(z.enum(["month", "year", "all"])),
    ])
  )
  .implement(async (id, input) => {
    const range =
      typeof input === "string"
        ? input === "month"
          ? { from: dayjs().startOf("month").toDate(), to: dayjs().endOf("month").toDate() }
          : input === "year"
          ? { from: dayjs().startOf("year").toDate(), to: dayjs().endOf("year").toDate() }
          : undefined
        : { from: input.from, to: input.to };

    const cData = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, id),
      with: {
        day_entries: {
          where: (day_entries, operations) =>
            operations.and(
              ...(range
                ? [operations.gte(day_entries.date, range.from), operations.lte(day_entries.date, range.to)]
                : []),
              operations.eq(day_entries.deletedAt, isNull(day_entries.deletedAt))
            ),
          orderBy: (fields, operators) => operators.asc(fields.date),
        },
      },
    });
    type NEntries = NonNullable<typeof cData>;
    if (!cData) {
      return [] as NEntries["day_entries"];
    }
    return cData.day_entries;
  });

export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Profile = ProfileSelect;
