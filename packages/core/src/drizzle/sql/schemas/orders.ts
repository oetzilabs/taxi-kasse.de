import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { destinations } from "./destinations";
import { commonTable } from "./entity";
import { organizations } from "./organizations";

export const orders = commonTable(
  "orders",
  {
    destination_id: text("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    organization_id: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  },
  "order",
);

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;

export const order_relation = relations(orders, ({ one }) => ({
  dest: one(destinations, {
    fields: [orders.destination_id],
    references: [destinations.id],
  }),
  org: one(organizations, {
    fields: [orders.organization_id],
    references: [organizations.id],
  }),
}));
