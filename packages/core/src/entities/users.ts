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
  return db.select().from(users).where(eq(users.id, input));
});

export const findByEmail = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.select().from(users).where(eq(users.email, input));
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.select().from(users).where(eq(users.name, input));
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.select().from(users);
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

export const findProfileById = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const [x] = await db.select().from(profiles).where(eq(profiles.userId, input)).limit(1);
  return x;
});

export type Frontend = {
  name: string;
  email: string;
  image: string;
  profile: ProfileSelect;
};

export type Profile = ProfileSelect;
