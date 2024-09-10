import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { organization_companies } from "./organization_companies";
import { organization_discounts } from "./organization_discounts";
import { organization_regions } from "./organization_regions";
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
    website: text("website"),
    email: text("email").notNull(),

    uid: text("uid").notNull().default(""),

    base_charge: decimal("base_charge", { scale: 2 }).default("0.00"),
    distance_charge: decimal("distance_charge", { scale: 2 }).default("0.00"),
    time_charge: decimal("time_charge", { scale: 2 }).default("0.00"),
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
  companies: many(organization_companies),
  employees: many(user_organizations),
  regions: many(organization_regions),
  discounts: many(organization_discounts),
}));
