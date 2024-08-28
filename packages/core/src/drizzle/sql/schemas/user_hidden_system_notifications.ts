import { relations } from "drizzle-orm";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { system_notifications } from "./system_notifications";
import { users } from "./users";
import { schema } from "./utils";

export const user_hidden_system_notifications = schema.table(
  "user_hidden_system_notifications",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    system_notification_id: text("system_notification_id")
      .notNull()
      .references(() => system_notifications.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    pK: primaryKey({ columns: [table.user_id, table.system_notification_id] }),
  }),
);

export type UserHiddenSystemNotificationSelect = typeof user_hidden_system_notifications.$inferSelect;
export type UserHiddenSystemNotificationInsert = typeof user_hidden_system_notifications.$inferInsert;

export const user_hidden_system_notification_relation = relations(user_hidden_system_notifications, ({ one }) => ({
  user: one(users, {
    fields: [user_hidden_system_notifications.user_id],
    references: [users.id],
  }),
  system_notification: one(system_notifications, {
    fields: [user_hidden_system_notifications.system_notification_id],
    references: [system_notifications.id],
  }),
}));
