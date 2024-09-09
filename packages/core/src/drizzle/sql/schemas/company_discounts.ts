import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { discounts } from "./discounts";
import { schema } from "./utils";

export const company_discounts = schema.table(
  "company_discounts",
  {
    company_id: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
    discount_id: text("discount_id").references(() => discounts.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.company_id, table.discount_id] }),
  }),
);

export type CompanyDealSelect = typeof company_discounts.$inferSelect;
export type CompanyDealInsert = typeof company_discounts.$inferInsert;

export const company_discount_relation = relations(company_discounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [company_discounts.company_id],
    references: [companies.id],
  }),
  discount: one(discounts, {
    fields: [company_discounts.discount_id],
    references: [discounts.id],
  }),
}));
