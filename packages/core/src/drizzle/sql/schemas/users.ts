import { relations } from "drizzle-orm";
import { text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { Utils } from "../../../entities/utils";
import { Validator } from "../../../validator";
import { commonTable } from "./entity";
import { user_role } from "./roles";
import { user_companies } from "./user_companies";
import { user_organizations } from "./user_organizations";
import { schema } from "./utils";
import { vehicles } from "./vehicles";

export const currency_code = schema.enum("currency_code", ["USD", "EUR", "GBP", "CHF", "JPY", "AUD", "CAD", "NZD"]);

export const users = commonTable(
  "users",
  {
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image"),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    role: user_role("role").default("member").notNull(),
    currency_code: currency_code("currency_code").notNull().default("USD"),
    referral_code: varchar("referral_code").$defaultFn(() => Utils.generateReferralCode()),
  },
  "user",
);

export const sessions = schema.table("session", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "no action",
    }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  access_token: text("access_token"),
  organization_id: text("organization_id"),
  company_id: text("company_id"),
});

export const userRelation = relations(users, ({ many }) => ({
  sessions: many(sessions),
  orgs: many(user_organizations),
  companies: many(user_companies),
  vehicles: many(vehicles),
}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const UserUpdateSchema = createInsertSchema(users)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: Validator.prefixed_cuid2 });

export const sessionRelation = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  employee: many(user_organizations),
}));

export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export const SessionUpdateSchema = createInsertSchema(sessions)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: Validator.prefixed_cuid2 });
