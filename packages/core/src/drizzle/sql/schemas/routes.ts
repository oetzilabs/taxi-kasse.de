import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { route_segments } from "./route_segments";
import { routes_waypoints } from "./route_waypoints";
import { users } from "./users";

export const routes = commonTable(
  "routes",
  {
    name: text("name").notNull(), // Optional: Add route name or identifier
    description: text("description"), // Optional: Brief description of the route
    driver_id: text("driver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  "route",
);

export type RouteSelect = typeof routes.$inferSelect;
export type RouteInsert = typeof routes.$inferInsert;

export const route_relations = relations(routes, ({ many, one }) => ({
  segments: many(route_segments),
  waypoints: many(routes_waypoints),
  driver: one(users, {
    fields: [routes.driver_id],
    references: [users.id],
  }),
}));
