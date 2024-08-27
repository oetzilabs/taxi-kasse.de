import { relations } from "drizzle-orm";
import { text, decimal } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";

export const destinations = commonTable(
  "destinations",
  {
    latitude: decimal("latitude", { scale: 6 }).notNull(),
    longitude: decimal("longitude", { scale: 6 }).notNull(),
    streetname: text("streetname").notNull(),
    zipcode: text("zipcode").notNull(),
    country: text("country").notNull(),
  },
  "destination",
);

export type DestinationSelect = typeof destinations.$inferSelect;
export type DestinationInsert = typeof destinations.$inferInsert;

export const desitnation_relation = relations(destinations, ({ one }) => ({}));
