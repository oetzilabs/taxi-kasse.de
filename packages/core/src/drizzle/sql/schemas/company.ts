import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const companies = sqliteTable("companies", {
  ...Entity.defaults,
  ownerId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image").notNull().default("/images/default-profile.png"),
  phoneNumber: text("phone_number"),
  email: text("email").notNull(),
});

export type CompanySelect = typeof companies.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;

export const companyRelation = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  employees: many(users),
}));
