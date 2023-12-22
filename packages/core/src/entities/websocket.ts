import { z } from "zod";
import { db } from "../drizzle/sql/index";
import { websockets } from "../drizzle/sql/schema";
import { eq } from "drizzle-orm";
import { Notify } from "./notifications";
import { WebSocketApi } from "sst/node/websocket-api";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

export * as WebsocketCore from "./websocket";

export const connect = z.function(z.tuple([z.string()])).implement(async (connectionId) => {
  const [x] = await db.insert(websockets).values({ connectionId }).returning({
    id: websockets.id,
    connectionId: websockets.connectionId,
  });
  return x;
});

export const update = z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (connectionId, userId) => {
  const [x] = await db
    .update(websockets)
    .set({ updatedAt: new Date(), userId })
    .where(eq(websockets.connectionId, connectionId))
    .returning({
      id: websockets.id,
      connectionId: websockets.connectionId,
    });
  return x;
});

export const disconnect = z.function(z.tuple([z.string()])).implement(async (connectionId) => {
  const [x] = await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).returning({
    id: websockets.id,
    connectionId: websockets.connectionId,
  });
  return x;
});

const sendMessageToConnection = async (notification: Notify, connectionId: string) => {
  const apiG = new ApiGatewayManagementApi({
    endpoint: WebSocketApi.ws.httpsUrl,
  });
  try {
    // Send the message to the given client
    await apiG.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(notification) });
  } catch (e: unknown) {
    const eTyped = e as { statusCode: number };
    if (eTyped.statusCode === 410) {
      // Remove stale connections
      await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).execute();
    } else {
      console.error(e);
    }
  }
};

export const sendmessage = z.function(z.tuple([z.custom<Notify>()])).implement(async (notification) => {
  // get all connectionstrings
  const connectionIds = await db.select({ connectionId: websockets.connectionId }).from(websockets).execute();
  const sentResult = [];
  // send message to all connections
  for (let i = 0; i < connectionIds.length; i++) {
    const connectionId = connectionIds[i].connectionId;
    await sendMessageToConnection(notification, connectionId);
    sentResult.push({
      connectionId,
      notification,
    });
  }
  return sentResult;
});
