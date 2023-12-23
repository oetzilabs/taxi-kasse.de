import { ApiHandler, usePathParam } from "sst/node/api";
import { error, getUser, json } from "../utils";
import { Notifications, Notify } from "@taxi-kassede/core/entities/notifications";
import { z } from "zod";
import { WebsocketCore } from "@taxi-kassede/core/entities/websocket";

export const main = ApiHandler(async (event) => {
  const user = await getUser(event);
  if (user instanceof Error) {
    return error("User not authenticated");
  }
  const payload = JSON.parse(event.body || "{}");
  if (!payload) {
    return error("No payload");
  }

  const valid = z.custom<Omit<Notify, "id">>().safeParse(payload);
  if (!valid.success) {
    return error("Invalid payload");
  }

  const notification = await Notifications.create(valid.data);

  const x = await WebsocketCore.broadcast(notification);

  return json(x);
});

export const dismiss = ApiHandler(async (event) => {
  const user = await getUser(event);
  if (user instanceof Error) {
    return error("User not authenticated");
  }
  const nid = usePathParam("nid");
  if (!nid) {
    return error("No payload");
  }

  const valid = z.string().uuid().safeParse(nid);
  if (!valid.success) {
    return error("Invalid payload");
  }

  const x = await Notifications.dismiss(user.id, valid.data);

  return json(x);
});

export const dismissAll = ApiHandler(async (event) => {
  const user = await getUser(event);
  if (user instanceof Error) {
    return error("User not authenticated");
  }

  const x = await Notifications.dismissAll(user.id);

  return json({
    message: "Notification dismissed",
    x,
  });
});
