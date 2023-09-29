import { integer, numeric, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { companies } from "./company";

export const day_entries = sqliteTable("day_entries", {
  ...Entity.defaults,
  ownerId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  date: integer("date", {
    mode: "timestamp",
  }).notNull(),
  total_distance: real("total_distance").notNull(),
  driven_distance: real("driven_distance").notNull(),
  tour_count: integer("tour_count").notNull(),
  cash: real("cash").notNull(),
});

export type DayEntrySelect = typeof day_entries.$inferSelect;
export type DayEntryInsert = typeof day_entries.$inferInsert;

export const dayEntryRelation = relations(day_entries, ({ one }) => ({
  user: one(users, {
    fields: [day_entries.ownerId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [day_entries.companyId],
    references: [companies.id],
  }),
}));
