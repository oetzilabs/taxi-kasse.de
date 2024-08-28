import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";

export const addresses = commonTable(
  "addresses",
  {
    latitude: decimal("latitude", { scale: 6 }).notNull(),
    longitude: decimal("longitude", { scale: 6 }).notNull(),
    streetname: text("streetname").notNull(),
    zipcode: text("zipcode").notNull(),
    country: text("country").notNull(),
  },
  "address",
);

export type AddressSelect = typeof addresses.$inferSelect;
export type AddressInsert = typeof addresses.$inferInsert;

export const address_relation = relations(addresses, ({ one }) => ({}));
