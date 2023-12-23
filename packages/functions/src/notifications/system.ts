import { SNSEvent } from "aws-lambda";
import { ApiHandler } from "sst/node/api";
import { json } from "../utils";
import { Topic } from "sst/node/topic";
import { Notifications } from "@taxi-kassede/core/entities/notifications";
import { WebSocketApiHandler } from "sst/node/websocket-api";
import { WebsocketCore } from "@taxi-kassede/core/entities/websocket";

export async function main(event: SNSEvent) {
  // here the incoming notifications are sent to all connected clients
  const records = event.Records;
  const clients: Record<string, any> = {};
  for (const record of records) {
    console.log(`Receipt sent: "${record.Sns.Message}"`);
    const message = JSON.parse(record.Sns.Message);
    const x = await WebsocketCore.broadcast(message);
    clients[record.Sns.MessageId] = x.map((x) => x.connectionId);
  }

  return json(clients);
}

export const publish = WebSocketApiHandler(async () => {
  const n: Notifications.Notify = {
    id: "test-system-notification",
    type: "system:info",
    title: "Test",
    content: "Test",
    dismissedAt: null,
  };
  const publishedNotification = await Notifications.publish(n);

  return json({
    message: "Receipt sent",
    notification: publishedNotification,
  });
});
