import { relations } from "drizzle-orm";
import { json, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";

export type SystemNotificationAction =
  | {
      type: "hide";
      label: string;
    }
  | {
      type: "open:link";
      label: string;
      href: string;
    };

export const system_notifications = commonTable(
  "system_notifications",
  {
    title: text("title").notNull(),
    message: text("message"),
    action: json("action").$type<SystemNotificationAction>().default({ type: "hide", label: "Close" }),
  },
  "system_notification",
);

export type SystemNotificationSelect = typeof system_notifications.$inferSelect;
export type SystemNotificationInsert = typeof system_notifications.$inferInsert;

export const system_notification_relation = relations(system_notifications, ({ one }) => ({}));
