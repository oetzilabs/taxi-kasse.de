import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
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
    email: text("email").notNull(),
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
}));
