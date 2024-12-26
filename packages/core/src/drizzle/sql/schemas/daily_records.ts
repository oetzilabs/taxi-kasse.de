import { relations } from "drizzle-orm";
import { date, decimal, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { companies } from "./companies";
import { commonTable } from "./entity";
import { users } from "./users";

export const daily_records = commonTable(
  "daily_records",
  {
    company_id: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    created_by: text("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date", {
      mode: "date",
    }).notNull(),
    total_distance: text("total_distance").notNull(),
    occupied_distance: text("occupied_distance").notNull(),
    tour: integer("tour").notNull(),
    revenue: decimal("revenue", {
      scale: 2,
    }).notNull(),
  },
  "dr",
);

export type DailyRecordSelect = typeof daily_records.$inferSelect;
export type DailyRecordInsert = typeof daily_records.$inferInsert;

export const DailyRecordsCreateSchema = createInsertSchema(daily_records);
export const DailyRecordsSelectSchema = createSelectSchema(daily_records);

export const daily_records_relation = relations(daily_records, ({ one }) => ({
  createdBy: one(users, {
    fields: [daily_records.created_by],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [daily_records.company_id],
    references: [companies.id],
  }),
}));
