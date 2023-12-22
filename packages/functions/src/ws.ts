import { APIGatewayProxyHandler, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { error, json } from "./utils";
import { StatusCodes } from "http-status-codes";

import { WebsocketCore } from "@taxi-kassede/core/entities/websocket";
import { sessions } from "./auth";
import { WebSocketApiHandler } from "sst/node/websocket-api";

export const connect = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) {
    console.log("connectionid missing", connectionId);
    return error("No connectionId", StatusCodes.BAD_REQUEST);
  }
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
  if (!connectionId) {
    console.log("connectionid missing", event);
    return error("No connectionId", StatusCodes.BAD_REQUEST);
  }
  const payload = JSON.parse(event.body || "{}");
  if (!payload.userId) {
    console.log("userId missing", payload);
    return error("No userId", StatusCodes.BAD_REQUEST);
  }
  const userId = payload.userId;
  const x = await WebsocketCore.update(connectionId, userId);
  return json(x);
});

export const main = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) {
    console.log("connectionid missing", event);
    return error("No connectionId", StatusCodes.BAD_REQUEST);
  }
  const payload = JSON.parse(event.body || "{}");
  if (!payload.userId) {
    console.log("userId missing", payload);
    return error("No userId", StatusCodes.BAD_REQUEST);
  }
  const userId = payload.userId;
  const x = await WebsocketCore.update(connectionId, userId);
  return json(x);
});

export const sendnotification = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext.requestId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);

  const x = await WebsocketCore.sendmessage({
    id: "test-user-notification",
    type: "user:info",
    title: "Test",
    content: "Test",
    dismissedAt: null,
  });

  return json(x);
});
