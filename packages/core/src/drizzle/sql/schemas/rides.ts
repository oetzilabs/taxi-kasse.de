import { relations } from "drizzle-orm";
import { decimal, text, timestamp } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { commonTable } from "./entity";
import { routes } from "./routes";
import { users } from "./users";
import { schema } from "./utils";
import { vehicles } from "./vehicles";

export const ride_status = schema.enum("ride_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
  "cancelled",
  "archived",
]);

export const ride_added_by = schema.enum("ride_added", ["user:manual", "system:auto", "admin:manual"]);

export const rides = commonTable(
  "rides",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company_id: text("company_id").references(() => companies.id, { onDelete: "set null" }),
    income: decimal("income", { scale: 2 }).notNull().default("0.00"),
    distance: decimal("distance", { scale: 3 }).notNull().default("0.000"),
    vehicle_id: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    rating: decimal("rating", { scale: 2 }).notNull().default("0.00"),
    status: ride_status("status").notNull().default("pending"),
    added_by: ride_added_by("added_by").notNull().default("system:auto"),
    startedAt: timestamp("startedAt").notNull(),
    endedAt: timestamp("endedAt").notNull(),
  },
  "ride",
);

export type RideSelect = typeof rides.$inferSelect;
export type RideInsert = typeof rides.$inferInsert;

export const ride_relation = relations(rides, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [rides.vehicle_id],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [rides.user_id],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [rides.company_id],
    references: [companies.id],
  }),
  routes: many(routes),
}));
