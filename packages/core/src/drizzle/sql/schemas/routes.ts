import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { route_segments } from "./route_segments";

export const routes = commonTable(
  "routes",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(), // Optional: Add route name or identifier
    description: text("description"), // Optional: Brief description of the route
  },
  "route",
);

export type RouteSelect = typeof routes.$inferSelect;
export type RouteInsert = typeof routes.$inferInsert;

export const route_relations = relations(routes, ({ many }) => ({
  segments: many(route_segments),
}));
