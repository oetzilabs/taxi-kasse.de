import { action, query } from "@solidjs/router";
import { SystemNotifications } from "@taxikassede/core/src/entities/system_notifications";
import { ensureAuthenticated } from "../auth/context";

export const getSystemNotifications = query(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const notifications = await SystemNotifications.allNonHiddenByUser(ctx.user.id);

  return notifications;
}, "system-notifications");

export const hideSystemNotification = action(async (id: string) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const sys_noti = await SystemNotifications.findById(id);
  if (!sys_noti) throw new Error("System Notification not found");

  const hidden = await SystemNotifications.userHidesById(sys_noti.id, ctx.user.id);
  return hidden;
});
