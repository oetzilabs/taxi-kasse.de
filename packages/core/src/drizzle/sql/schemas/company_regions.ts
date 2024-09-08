import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { regions } from "./regions";
import { schema } from "./utils";

export const company_regions = schema.table(
  "company_regions",
  {
    company_id: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    region_id: text("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.company_id, table.region_id] }),
  }),
);

export type CompanyRegionSelect = typeof company_regions.$inferSelect;
export type CompanyRegionInsert = typeof company_regions.$inferInsert;

export const company_region_relation = relations(company_regions, ({ one }) => ({
  region: one(regions, {
    fields: [company_regions.region_id],
    references: [regions.id],
  }),
  company: one(companies, {
    fields: [company_regions.company_id],
    references: [companies.id],
  }),
}));
