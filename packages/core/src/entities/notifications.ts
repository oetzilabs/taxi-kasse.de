import { z } from "zod";
import { SNS } from "@aws-sdk/client-sns";
import { Topic } from "sst/node/topic";

export * as Notifications from "./notifications";

type NotificationEntity = "system" | "user" | "company";
type NotificationAction = "info" | "warning" | "error";
type NotificationType = `${NotificationEntity}:${NotificationAction}`;

export type Notify = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  dismissedAt: Date | null;
};

const sns = new SNS();

export const publish = z.function(z.tuple([z.custom<Notify>()])).implement(async (n) => {
  const notificationString = JSON.stringify(n);
  const x = await sns.publish({
    TopicArn: Topic["notifications"].topicArn,
    Message: notificationString,
    MessageStructure: "string",
  });
  return x;
});
