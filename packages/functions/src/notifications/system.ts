import { SNSEvent } from "aws-lambda";
import { ApiHandler } from "sst/node/api";
import { json } from "../utils";
import { Topic } from "sst/node/topic";
import { Notifications } from "@taxi-kassede/core/entities/notifications";
import { WebSocketApiHandler } from "sst/node/websocket-api";

export async function main(event: SNSEvent) {
  const records: any[] = event.Records;
  console.log(`Receipt sent: "${records[0].Sns.Message}"`);

  return {};
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
