import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { vehicles } from "./vehicles";

export const vehicle_models = commonTable(
  "vehicle_models",
  {
    brand: text("brand").notNull(),
    name: text("name").notNull(),
  },
  "vehicle_model",
);

export type VehicleModelSelect = typeof vehicle_models.$inferSelect;
export type VehicleModelInsert = typeof vehicle_models.$inferInsert;

export const vehicle_model_relation = relations(vehicle_models, ({ one, many }) => ({
  vehicles: many(vehicles),
}));
