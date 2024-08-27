import { relations } from "drizzle-orm";
import { decimal, integer, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { routes } from "./routes";
import { segment_points } from "./segment_points";

// Route Segments table
export const route_segments = commonTable(
  "route_segments",
  {
    route_id: text("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(), // Order of the segment within the route
    direction: decimal("direction", { scale: 2 }), // Direction in degrees (0-360)
    distance: decimal("distance", { scale: 3 }).notNull(), // Distance for the segment in meters/kilometers
  },
  "route_segment",
);
export type RouteSegmentSelect = typeof route_segments.$inferSelect;
export type RouteSegmentInsert = typeof route_segments.$inferInsert;

export const segment_relations = relations(route_segments, ({ one, many }) => ({
  route: one(routes, {
    fields: [route_segments.route_id],
    references: [routes.id],
  }),
  points: many(segment_points),
}));
