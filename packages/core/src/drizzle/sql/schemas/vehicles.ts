import { relations } from "drizzle-orm";
import { decimal, text, timestamp } from "drizzle-orm/pg-core";
import { earnings } from "./earnings";
import { commonTable } from "./entity";
import { users } from "./users";

export const vehicles = commonTable(
  "vehicles",
  {
    owner_id: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    license_plate: text("license_plate").notNull(),
    model: text("model").notNull(),
    inspection_date: timestamp("inspection_date", {
      withTimezone: true,
      mode: "date",
    }),
    mileage: decimal("mileage", { scale: 3 }).notNull().default("0.000"),
  },
  "vehicle"
);

export type VehicleSelect = typeof vehicles.$inferSelect;
export type VehicleInsert = typeof vehicles.$inferInsert;

export const vehicle_relation = relations(vehicles, ({ one, many }) => ({
  earnings: many(earnings),
  owner_id: one(users, {
    fields: [vehicles.owner_id],
    references: [users.id],
  }),
}));
