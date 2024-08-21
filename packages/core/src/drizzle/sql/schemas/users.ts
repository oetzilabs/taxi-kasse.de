import { relations } from "drizzle-orm";
import { text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { plan_comment_user_mention_notifications } from "./notifications/plan/comment_user_mention";
import { organizations_joins } from "./organizations_joins";
import { plan_comments } from "./plan_comments";
import { users_organizations } from "./user_organizations";
import { users_workspaces } from "./users_workspaces";
import { schema } from "./utils";

export const users = commonTable(
  "users",
  {
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "date",
    }),
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
  workspace_id: varchar("workspace_id"),
  organization_id: varchar("organization_id"),
});

export const userRelation = relations(users, ({ many }) => ({
  sessions: many(sessions),
  workspaces: many(users_workspaces),
  organizations: many(users_organizations),
  joins: many(organizations_joins),
  notification_comment_mentions: many(plan_comment_user_mention_notifications),
  comments: many(plan_comments),
}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export const UserUpdateSchema = createInsertSchema(users)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: prefixed_cuid2 });

export const sessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export const SessionUpdateSchema = createInsertSchema(sessions)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: prefixed_cuid2 });
