import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { CompanySelect, companies } from "../drizzle/sql/schema";

export * as Company from "./company";

export const create = z.function(z.tuple([createInsertSchema(companies)])).implement(async (companyInput) => {
  const [x] = await db.insert(companies).values(companyInput).returning();

  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${companies.id})`,
    })
    .from(companies);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.select().from(companies).where(eq(companies.id, input)).limit(1);
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.select().from(companies).where(eq(companies.name, input));
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.select().from(companies);
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(companies)
        .deepPartial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    return db
      .update(companies)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(companies.id, input.id))
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

export type CompanyFrontend = {
  id: string;
  name: string;
};

export type Company = CompanySelect;
