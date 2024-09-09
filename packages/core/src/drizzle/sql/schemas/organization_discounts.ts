import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { discounts } from "./discounts";
import { organizations } from "./organizations";
import { schema } from "./utils";

export const organization_discounts = schema.table(
  "organization_discounts",
  {
    organization_id: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    discount_id: text("discount_id").references(() => discounts.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.organization_id, table.discount_id] }),
  }),
);

export type OrganizationDealSelect = typeof organization_discounts.$inferSelect;
export type OrganizationDealInsert = typeof organization_discounts.$inferInsert;

export const organization_deal_relation = relations(organization_discounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [organization_discounts.organization_id],
    references: [organizations.id],
  }),
  discount: one(discounts, {
    fields: [organization_discounts.discount_id],
    references: [discounts.id],
  }),
}));
