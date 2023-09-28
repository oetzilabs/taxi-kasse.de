import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
  ...Entity.defaults,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  birthdate: text("birthdate"),
  image: text("image").notNull().default("/images/default-profile.png"),
  preferredUsername: text("preferred_username"),
  locale: text("locale").default("en"),
  phoneNumber: text("phone_number"),
});

export type ProfileSelect = typeof profiles.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;

export const profileRelation = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
