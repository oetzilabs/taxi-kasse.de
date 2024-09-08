import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { company_regions } from "./company_regions";
import { commonTable } from "./entity";

export const regions = commonTable(
  "regions",
  {
    name: text("name").notNull(),
  },
  "region",
);

export type RegionSelect = typeof regions.$inferSelect;
export type RegionInsert = typeof regions.$inferInsert;

export const region_relation = relations(regions, ({ one, many }) => ({
  organizations: many(company_regions),
}));
