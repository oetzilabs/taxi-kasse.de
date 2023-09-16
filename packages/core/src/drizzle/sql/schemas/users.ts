import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { relations } from "drizzle-orm";
import { profiles } from "./profile";

export const users = pgTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const userRelation = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));
