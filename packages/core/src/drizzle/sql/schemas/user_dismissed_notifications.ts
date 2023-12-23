import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { notifications } from "./notifications";
import { users } from "./users";

export const user_dismissed_notifications = sqliteTable("user_dismissed_notifications", {
  ...Entity.defaults,
  notificationId: text("notification_id")
    .notNull()
    .references(() => notifications.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dismissedAt: integer("dismissed_at", {
    mode: "timestamp",
  }).notNull(),
});

export type UserDismissedNotificationsSelect = typeof user_dismissed_notifications.$inferSelect;
export type UserDismissedNotificationsInsert = typeof user_dismissed_notifications.$inferInsert;

export const user_dismissed_notificationsRelation = relations(user_dismissed_notifications, ({ one, many }) => ({
  notification: one(notifications, {
    fields: [user_dismissed_notifications.notificationId],
    references: [notifications.id],
  }),
  user: one(users, {
    fields: [user_dismissed_notifications.userId],
    references: [users.id],
  }),
}));
