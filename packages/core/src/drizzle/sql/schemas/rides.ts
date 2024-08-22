import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { organizations } from "./organizations";
import { users } from "./users";
import { vehicles } from "./vehicles";

export const rides = commonTable(
  "rides",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    org_id: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    income: decimal("income", { scale: 2 }).notNull().default("0.00"),
    distance: decimal("distance", { scale: 3 }).notNull().default("0.000"),
    vehicle_id: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    rating: decimal("rating", { scale: 2 }).notNull().default("0.00"),
  },
  "ride"
);

export type RideSelect = typeof rides.$inferSelect;
export type RideInsert = typeof rides.$inferInsert;

export const ride_relation = relations(rides, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [rides.vehicle_id],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [rides.user_id],
    references: [users.id],
  }),
  org: one(organizations, {
    fields: [rides.org_id],
    references: [organizations.id],
  }),
}));
