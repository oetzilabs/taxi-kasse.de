import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { relations } from "drizzle-orm";
import { profiles } from "./profile";
import { companies } from "./company";

export const users = sqliteTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  companyId: text("company_id"),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const userRelation = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));
