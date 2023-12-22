import { ApiHandler } from "sst/node/api";
import { error, getUser, json } from "../utils";
import { Notifications, Notify } from "@taxi-kassede/core/entities/notifications";
import { z } from "zod";
import { WebsocketCore } from "@taxi-kassede/core/entities/websocket";

export const main = ApiHandler(async (event) => {
  const user = await getUser(event);
  if (!user) {
    return error("User not authenticated");
  }
  console.log("Receipt sent");
  const payload = JSON.parse(event.body || "{}");
  if (!payload) {
    return error("No payload");
  }

  const valid = z.custom<Notify>().safeParse(payload);
  if (!valid.success) {
    return error("Invalid payload");
  }

  const x = await WebsocketCore.sendmessage({
    id: "test-user-notification",
    type: "user:info",
    title: "Test",
    content: "Test",
    dismissedAt: null,
  });

  return json({
    message: "Receipt sent",
    x,
  });
});
