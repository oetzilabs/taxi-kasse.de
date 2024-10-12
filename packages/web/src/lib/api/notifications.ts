import { action, redirect } from "@solidjs/router";
import { Notifications } from "@taxikassede/core/src/entities/notifications";
import { getContext } from "../auth/context";

export const getAllNotifications = async () => {
  "use server";

  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const sys_notifications = await Notifications.allNonHiddenByUser(ctx.user.id, "system");

  const org_notifications = await Notifications.allNonHiddenByUser(ctx.user.id, "organization");

  const company_notifications = await Notifications.allNonHiddenByUser(ctx.user.id, "company");
  const notifications = sys_notifications.concat(org_notifications, company_notifications);
  return notifications;
};

export const hideNotification = action(async (id: string, type: Notifications.Types) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const notification = await Notifications.findById(id, type);
  if (!notification) throw new Error("System Notification not found");

  const hidden = await Notifications.userHidesById(notification.id, type, ctx.user.id);
  return hidden;
});
