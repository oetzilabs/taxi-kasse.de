import { StatusCodes } from "http-status-codes";
import { error, json } from "./utils";

import { WebsocketCore } from "@taxi-kassede/core/entities/websocket";
import { WebSocketApiHandler } from "sst/node/websocket-api";

export const connect = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const x = await WebsocketCore.connect(connectionId);
  return json(x);
});

export const disconnect = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const x = await WebsocketCore.disconnect(connectionId);
  return json(x);
});

export const ping = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const payload = JSON.parse(event.body || "{}");
  if (!payload.userId) return error("No userId", StatusCodes.BAD_REQUEST);
  const userId = payload.userId;
  const x = await WebsocketCore.update(connectionId, userId);
  const id = payload.id;
  const sentAt = Date.now();

  await WebsocketCore.sendMessageToConnection(
    {
      type: "pong",
      recievedId: id,
      sentAt: Date.now(),
    },
    connectionId
  );

  // const missingNotifications = await Notifications.sendMissingNotifications(userId);
  // console.log("missingNotifications", missingNotifications);
  return json({
    type: "pong",
    recievedId: id,
    sentAt,
  });
});

export const main = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const payload = JSON.parse(event.body || "{}");
  if (!payload.userId) return error("No userId", StatusCodes.BAD_REQUEST);
  const userId = payload.userId;
  const x = await WebsocketCore.update(connectionId, userId);
  return json(x);
});

export const sendnotification = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.requestId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);

  const x = await WebsocketCore.broadcast({
    id: "test-user-notification",
    type: "user:info",
    title: "Test",
    content: "Test",
    dismissedAt: null,
  });

  return json(x);
});
