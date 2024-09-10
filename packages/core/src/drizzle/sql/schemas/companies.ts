import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { company_discounts } from "./company_discounts";
import { company_regions } from "./company_regions";
import { commonTable } from "./entity";
import { user_companies } from "./user_companies";
import { users } from "./users";

export const companies = commonTable(
  "companies",
  {
    ownerId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),

    image: text("image").notNull().default("/images/default-company-profile.png"),
    banner: text("banner").notNull().default("/images/default-company-banner.png"),

    phoneNumber: text("phone_number"),
    website: text("website"),
    email: text("email").notNull(),

    uid: text("uid").notNull().default(""),

    base_charge: decimal("base_charge", { scale: 2 }).default("0.00"),
    distance_charge: decimal("distance_charge", { scale: 2 }).default("0.00"),
    time_charge: decimal("time_charge", { scale: 2 }).default("0.00"),
  },
  "company",
);

export type CompanySelect = typeof companies.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;

export const company_relation = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  employees: many(user_companies),
  regions: many(company_regions),
  discounts: many(company_discounts),
}));
