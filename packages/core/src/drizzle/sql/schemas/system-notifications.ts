import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";

export const system_notifications = commonTable(
  "system_notifications",
  {
    message: text("message").notNull(),
    bg_color: text("bg_color").notNull().default("#000000"),
    text_color: text("text_color").notNull().default("#FFFFFF"),
  },
  "sys_notif",
);

export type SystemNotificationSelect = typeof system_notifications.$inferSelect;
export type SystemNotificationInsert = typeof system_notifications.$inferInsert;

export const system_notification_relation = relations(system_notifications, ({ one }) => ({}));
