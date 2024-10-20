import { relations } from "drizzle-orm";
import { date, decimal, text, time } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { companies } from "./companies";
import { commonTable } from "./entity";
import { regions } from "./regions";
import { users } from "./users";

export const events = commonTable(
  "events",
  {
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    contentHTML: text("content_html").notNull().default(""),
    contentText: text("content_text").notNull().default(""),
    created_by: text("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    region_id: text("region_id").references(() => regions.id, { onDelete: "set null" }),
    // Address of the event
    origin_id: text("origin_id").references(() => addresses.id, { onDelete: "set null" }),
    date: date("date").notNull(),
    time: time("time").notNull(),
  },
  "event",
);

export type EventSelect = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

export const event_relation = relations(events, ({ one }) => ({
  createdBy: one(users, {
    fields: [events.created_by],
    references: [users.id],
  }),
  region: one(regions, {
    fields: [events.region_id],
    references: [regions.id],
  }),
  origin: one(addresses, {
    fields: [events.origin_id],
    references: [addresses.id],
  }),
}));
