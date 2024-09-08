import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { org_role } from "./roles";
import { users } from "./users";
import { schema } from "./utils";

export const organization_companies = schema.table(
  "organization_companies",
  {
    company_id: text("company_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organization_id: text("organization_id").references(() => companies.id, { onDelete: "set null" }),
    role: org_role("role").default("employee").notNull(),
  },
  (table) => ({
    primarKeys: [table.company_id, table.organization_id],
  }),
);

export type CompanyOrganizationSelect = typeof organization_companies.$inferSelect;
export type CompanyOrganizationInsert = typeof organization_companies.$inferInsert;

export const company_organizations_relation = relations(organization_companies, ({ one }) => ({
  company: one(companies, {
    fields: [organization_companies.company_id],
    references: [companies.id],
  }),
  organization: one(companies, {
    fields: [organization_companies.organization_id],
    references: [companies.id],
  }),
}));
