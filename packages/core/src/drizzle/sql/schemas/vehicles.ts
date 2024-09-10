import { relations } from "drizzle-orm";
import { decimal, text, timestamp } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { rides } from "./rides";
import { users } from "./users";
import { vehicle_models } from "./vehicle_models";

export const vehicles = commonTable(
  "vehicles",
  {
    owner_id: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    license_plate: text("license_plate").notNull(),
    model_id: text("model_id").references(() => vehicle_models.id, { onDelete: "set null" }),
    inspection_date: timestamp("inspection_date", {
      withTimezone: true,
      mode: "date",
    }),
    mileage: decimal("mileage", { scale: 3 }).notNull().default("0.000"),

    overwrite_base_charge: decimal("overwrite_base_charge", { scale: 2 }).default("0.00"),
    overwrite_distance_charge: decimal("overwrite_distance_charge", { scale: 2 }).default("0.00"),
    overwrite_time_charge: decimal("overwrite_time_charge", { scale: 2 }).default("0.00"),
  },
  "vehicle",
);

export type VehicleSelect = typeof vehicles.$inferSelect;
export type VehicleInsert = typeof vehicles.$inferInsert;

export const vehicle_relation = relations(vehicles, ({ one, many }) => ({
  rides: many(rides),
  owner: one(users, {
    fields: [vehicles.owner_id],
    references: [users.id],
  }),
  model: one(vehicle_models, {
    fields: [vehicles.model_id],
    references: [vehicle_models.id],
  }),
}));
