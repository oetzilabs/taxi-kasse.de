import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { organization_regions } from "./organization_regions";
import { regions } from "./regions";
import { user_organizations } from "./user_organizations";
import { users } from "./users";

export const organizations = commonTable(
  "organizations",
  {
    ownerId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    image: text("image").notNull().default("/images/default-organization-profile.png"),
    banner: text("banner").notNull().default("/images/default-organization-banner.png"),
    phoneNumber: text("phone_number"),
    email: text("email").notNull(),
  },
  "org",
);

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;

export const organization_relation = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  employees: many(user_organizations),
  regions: many(organization_regions),
}));
