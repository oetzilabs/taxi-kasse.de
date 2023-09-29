import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProfileSelect, profiles, users } from "../drizzle/sql/schema";

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
export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Profile = ProfileSelect;
