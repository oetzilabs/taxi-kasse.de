import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { organizations } from "./organizations";
import { regions } from "./regions";
import { schema } from "./utils";

export const organization_regions = schema.table(
  "organization_regions",
  {
    organization_id: text("organization_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    region_id: text("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.organization_id, table.region_id] }),
  }),
);

export type OrganizationRegionSelect = typeof organization_regions.$inferSelect;
export type OrganizationRegionInsert = typeof organization_regions.$inferInsert;

export const organization_region_relation = relations(organization_regions, ({ one }) => ({
  region: one(regions, {
    fields: [organization_regions.region_id],
    references: [regions.id],
  }),
  organization: one(organizations, {
    fields: [organization_regions.organization_id],
    references: [organizations.id],
  }),
}));
