import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { routes } from "./routes";

export const routes_waypoints = commonTable(
  "routes_waypoints",
  {
    route_id: text("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "cascade" }),
    latitude: decimal("latitude", { scale: 6 }).notNull(),
    longitude: decimal("longitude", { scale: 6 }).notNull(),
  },
  "route_waypoint"
);

export type RouteWaypointSelect = typeof routes_waypoints.$inferSelect;
export type RouteWaypointInsert = typeof routes_waypoints.$inferInsert;

export const route_waypoints_relations = relations(routes_waypoints, ({ one }) => ({
  route: one(routes, {
    fields: [routes_waypoints.route_id],
    references: [routes.id],
  }),
}));
