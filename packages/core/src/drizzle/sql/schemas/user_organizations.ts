import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { organizations } from "./organizations";
import { org_role } from "./roles";
import { users } from "./users";
import { schema } from "./utils";

export const user_organizations = schema.table(
  "user_organizations",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organization_id: text("organization_id").references(() => organizations.id, { onDelete: "set null" }),
    role: org_role("role").default("employee").notNull(),
  },
  (table) => ({
    primarKeys: [table.user_id, table.organization_id],
  }),
);

export type UserOrganizationSelect = typeof user_organizations.$inferSelect;
export type UserOrganizationInsert = typeof user_organizations.$inferInsert;

export const user_organizations_relation = relations(user_organizations, ({ one }) => ({
  user: one(users, {
    fields: [user_organizations.user_id],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [user_organizations.organization_id],
    references: [organizations.id],
  }),
}));
