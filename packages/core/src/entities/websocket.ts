import { z } from "zod";
import { db } from "../drizzle/sql/index";
import { websockets } from "../drizzle/sql/schema";
import { eq, gte, lte } from "drizzle-orm";
import { Notify } from "./notifications";
import { WebSocketApi } from "sst/node/websocket-api";
import { ApiGatewayManagementApi, GoneException } from "@aws-sdk/client-apigatewaymanagementapi";
import dayjs from "dayjs";

export * as WebsocketCore from "./websocket";

export const connect = z.function(z.tuple([z.string()])).implement(async (connectionId) => {
  const [x] = await db.insert(websockets).values({ connectionId }).returning({
    id: websockets.id,
    connectionId: websockets.connectionId,
  });
  return x;
});

export const getConnection = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  const [x] = await db
    .select({ connectionId: websockets.connectionId })
    .from(websockets)
    .where(eq(websockets.userId, userId));
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

export const sendMessageToConnection = async (message: any, connectionId: string) => {
  const apiG = new ApiGatewayManagementApi({
    endpoint: WebSocketApi.ws.httpsUrl,
  });
  try {
    // Send the message to the given client
    await apiG.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(message) });
  } catch (e: unknown) {
    const eTyped = e as { statusCode: number };
    console.log("error sending message", e);
    if (eTyped.statusCode === 410) {
      // Remove stale connections
      await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).execute();
    } else if (eTyped instanceof GoneException) {
      console.log(`GoneException: ${eTyped.message}`);
      await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).execute();
    } else {
      console.error(e);
    }
  }
};

export const broadcast = z.function(z.tuple([z.any()])).implement(async (message) => {
  // get all connectionstrings
  const connectionIds = await db
    .select({ connectionId: websockets.connectionId })
    .from(websockets)
    .where(gte(websockets.updatedAt, dayjs().subtract(5, "minute").toDate()))
    .execute();
  const sentResult = [];
  // send message to all connections
  for (let i = 0; i < connectionIds.length; i++) {
    const connectionId = connectionIds[i].connectionId;
    await sendMessageToConnection(message, connectionId);
    sentResult.push({
      connectionId,
      notification: message,
    });
  }
  return sentResult;
});
