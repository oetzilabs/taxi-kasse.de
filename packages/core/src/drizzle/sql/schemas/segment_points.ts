import { relations } from "drizzle-orm";
import { decimal, integer, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { route_segments } from "./route_segments";
import { routes } from "./routes";
import { schema } from "./utils";

export const segment_point_type = schema.enum("segment_point_type", [
  "start",
  "waypoint",
  "u_turn",
  "merge",
  "exit",
  "fork",
  "bridge",
  "tunnel",
  "crosswalk",
  "turn",
  "straight",
  "end",
  "junction",
  "roundabout",
  "pedestrian_crossing",
  "rest_area",
  "toll_booth",
  "service_area",
  "ferry_crossing",
  "switchback",
  "scenic_viewpoint",
  "speed_bump",
  "dead_end",
  "overpass",
  "underpass",
  "railway_crossing",
  "hazard_zone",
  "yield_point",
  "parking_lot_entrance",
  "parking_lot_exit",
  "controlled_intersection",
  "shared_road",
  "one_way",
  "restricted_area",
  "other",
  "unknown",
]);

// Segment Points table
export const segment_points = commonTable(
  "segment_points",
  {
    segment_id: text("segment_id")
      .notNull()
      .references(() => route_segments.id, { onDelete: "cascade" }),
    latitude: decimal("latitude", { scale: 6 }).notNull(),
    longitude: decimal("longitude", { scale: 6 }).notNull(),
    elevation: decimal("elevation", { scale: 2 }), // Optional: Elevation at the point
    point_type: segment_point_type("point_type").default("unknown"),
  },
  "segment_point",
);

export type SegmentPointSelect = typeof segment_points.$inferSelect;
export type SegmentPointInsert = typeof segment_points.$inferInsert;

export const point_relations = relations(segment_points, ({ one }) => ({
  segment: one(route_segments, {
    fields: [segment_points.segment_id],
    references: [route_segments.id],
  }),
}));
