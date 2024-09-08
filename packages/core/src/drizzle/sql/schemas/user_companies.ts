import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { comp_role } from "./roles";
import { users } from "./users";
import { schema } from "./utils";

export const user_companies = schema.table(
  "user_companies",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company_id: text("company_id").references(() => companies.id, { onDelete: "set null" }),
    role: comp_role("role").default("employee").notNull(),
  },
  (table) => ({
    primarKeys: [table.user_id, table.company_id],
  }),
);

export type UserCompanySelect = typeof user_companies.$inferSelect;
export type UserCompanyInsert = typeof user_companies.$inferInsert;

export const user_company_relation = relations(user_companies, ({ one }) => ({
  user: one(users, {
    fields: [user_companies.user_id],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [user_companies.company_id],
    references: [companies.id],
  }),
}));
