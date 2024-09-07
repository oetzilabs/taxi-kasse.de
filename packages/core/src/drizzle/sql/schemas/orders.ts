import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { commonTable } from "./entity";
import { organizations } from "./organizations";
import { regions } from "./regions";
import { users } from "./users";

export const orders = commonTable(
  "orders",
  {
    destination_id: text("destination_id")
      .notNull()
      .references(() => addresses.id, { onDelete: "cascade" }),
    // start point
    origin_id: text("origin_id")
      .notNull()
      .references(() => addresses.id, { onDelete: "cascade" }),

    estimated_cost: decimal("estimated_cost", { scale: 2 }),

    organization_id: text("organization_id").references(() => organizations.id, { onDelete: "set null" }),
    driver_id: text("driver_id").references(() => users.id, { onDelete: "set null" }),
    region_id: text("region_id").references(() => regions.id, { onDelete: "set null" }),
    customer_id: text("customer_id").references(() => users.id, { onDelete: "set null" }),
  },
  "order",
);

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;

export const order_relation = relations(orders, ({ one }) => ({
  dest: one(addresses, {
    fields: [orders.destination_id],
    references: [addresses.id],
  }),
  origin: one(addresses, {
    fields: [orders.origin_id],
    references: [addresses.id],
  }),
  org: one(organizations, {
    fields: [orders.organization_id],
    references: [organizations.id],
  }),
  region: one(regions, {
    fields: [orders.region_id],
    references: [regions.id],
  }),
}));
