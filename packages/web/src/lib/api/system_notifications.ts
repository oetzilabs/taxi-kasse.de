import { action, cache, redirect } from "@solidjs/router";
import { SystemNotifications } from "@taxikassede/core/src/entities/system_notifications";
import { getContext } from "../auth/context";

export const getSystemNotifications = cache(async () => {
  "use server";

  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const notifications = await SystemNotifications.all();

  return notifications;
}, "system-notifications");

export const hideSystemNotification = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const sys_noti = await SystemNotifications.findById(id);
  if (!sys_noti) throw new Error("System Notification not found");

  const hidden = await SystemNotifications.userHidesById(sys_noti.id, ctx.user.id);
  return hidden;
});
