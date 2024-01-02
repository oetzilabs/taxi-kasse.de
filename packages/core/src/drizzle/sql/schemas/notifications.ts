import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";

export const notifications = sqliteTable("notifications", {
  ...Entity.defaults,
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", {
    enum: [
      "user:info",
      "user:warning",
      "user:error",
      "company:info",
      "company:warning",
      "company:error",
      "system:info",
      "system:warning",
      "system:error",
      "ping",
      "pong",
    ],
  }).notNull(),
  dismissedAt: integer("dismissed_at", {
    mode: "timestamp",
  }),
});

export type NotificationsSelect = typeof notifications.$inferSelect;
export type NotificationsInsert = typeof notifications.$inferInsert;

export const notificationsRelation = relations(notifications, ({ one, many }) => ({}));
