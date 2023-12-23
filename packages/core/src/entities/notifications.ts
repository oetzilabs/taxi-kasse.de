import { SNS } from "@aws-sdk/client-sns";
import { eq, inArray, notInArray } from "drizzle-orm";
import { Topic } from "sst/node/topic";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { notifications } from "../drizzle/sql/schemas/notifications";
import { user_dismissed_notifications } from "../drizzle/sql/schemas/user_dismissed_notifications";

export * as Notifications from "./notifications";

type NotificationEntity = "system" | "user" | "company";
type NotificationAction = "info" | "warning" | "error";
type NotificationType = `${NotificationEntity}:${NotificationAction}`;

export type Notify = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  dismissedAt: Date | null;
};

const sns = new SNS();

export const create = z.function(z.tuple([z.custom<Omit<Notify, "id">>()])).implement(async (n) => {
  const [x] = await db.insert(notifications).values(n).returning();
  return x;
});

export const sendMissingNotifications = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  // get all notifications
  // get all dismissed notifications
  // filter out dismissed notifications
  // send remaining notifications
  const _notifications = await db.select().from(notifications);
  const notificationsIds = _notifications.map((x) => x.id);
  const dismissedNotifications = await db
    .select({ notificationId: user_dismissed_notifications.notificationId })
    .from(user_dismissed_notifications)
    .where(eq(user_dismissed_notifications.userId, userId))
    .where(inArray(user_dismissed_notifications.notificationId, notificationsIds));
  const notificationsToSend = _notifications.filter(
    (x) => !dismissedNotifications.find((y) => y.notificationId === x.id)
  );
  return notificationsToSend;
});

export const publish = z.function(z.tuple([z.custom<Notify>()])).implement(async (n) => {
  const notificationString = JSON.stringify(n);
  const x = await sns.publish({
    TopicArn: Topic["notifications"].topicArn,
    Message: notificationString,
    MessageStructure: "string",
  });
  return x;
});

export const dismiss = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (userId, notificationId) => {
    // set dismissedAt to now
    const [x] = await db
      .insert(user_dismissed_notifications)
      .values({
        userId,
        notificationId,
        dismissedAt: new Date(),
      })
      .returning();
    return x;
  });

export const dismissAll = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  // set dismissedAt to now
  const dismissedNotifications = await db
    .select({ id: user_dismissed_notifications.notificationId })
    .from(user_dismissed_notifications)
    .where(eq(user_dismissed_notifications.userId, userId));
  const notificationsIds = dismissedNotifications.map((x) => x.id);
  if (!notificationsIds.length) {
    // check if there are any notifications
    const __notifications = await db.select().from(notifications);
    if (!__notifications.length) {
      // no notifications, nothing to dismiss
      return [];
    }
    // no dismissed notifications, dismiss all
    const newDismissedNotifications = [];
    for (let i = 0; i < __notifications.length; i++) {
      const [x] = await db
        .insert(user_dismissed_notifications)
        .values({
          userId,
          notificationId: __notifications[i].id,
          dismissedAt: new Date(),
        })
        .returning();
      newDismissedNotifications.push(x);
    }
    return newDismissedNotifications;
  }
  const toDismiss = await db
    .select({ notificationId: notifications.id })
    .from(notifications)
    .where(notInArray(notifications.id, notificationsIds));
  const newDismissedNotifications = [];
  for (let i = 0; i < toDismiss.length; i++) {
    const [x] = await db
      .insert(user_dismissed_notifications)
      .values({
        userId,
        notificationId: toDismiss[i].notificationId,
        dismissedAt: new Date(),
      })
      .returning();
    newDismissedNotifications.push(x);
  }
  return newDismissedNotifications;
});
