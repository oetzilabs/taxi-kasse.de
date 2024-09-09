import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { discounts } from "./discounts";
import { schema } from "./utils";

export const company_discounts = schema.table(
  "company_discounts",
  {
    company_id: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
    deal_id: text("deal_id").references(() => discounts.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.company_id, table.deal_id] }),
  }),
);

export type CompanyDealSelect = typeof company_discounts.$inferSelect;
export type CompanyDealInsert = typeof company_discounts.$inferInsert;

export const company_deal_relation = relations(company_discounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [company_discounts.company_id],
    references: [companies.id],
  }),
  deal: one(discounts, {
    fields: [company_discounts.deal_id],
    references: [discounts.id],
  }),
}));
