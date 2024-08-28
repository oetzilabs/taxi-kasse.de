import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { destinations } from "./destinations";
import { commonTable } from "./entity";
import { organizations } from "./organizations";
import { users } from "./users";

export const orders = commonTable(
  "orders",
  {
    destination_id: text("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    organization_id: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    estimated_cost: decimal("estimated_cost", { scale: 2 }),
    driver_id: text("driver_id").references(() => users.id, { onDelete: "cascade" }),
    customer_id: text("customer_id").references(() => users.id, { onDelete: "cascade" }),
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
