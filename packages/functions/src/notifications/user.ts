import { SNSEvent } from "aws-lambda";
import { WebSocketApiHandler } from "sst/node/websocket-api";
import { json } from "../utils";
import { Topic } from "sst/node/topic";
import { Notifications } from "@taxi-kassede/core/entities/notifications";

export async function main(event: SNSEvent) {
  const records: any[] = event.Records;
  console.log(`Receipt sent: "${records[0].Sns.Message}"`);

  return {};
}

export const publish = WebSocketApiHandler(async () => {
  const n: Notifications.Notify = {
    id: "test-user-notification",
    type: "user:info",
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
