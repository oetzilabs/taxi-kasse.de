import { Topic, StackContext, use, WebSocketApi } from "sst/constructs";
import { Secrets } from "./Secrets";
import { Domain } from "./Domain";

export function Notification({ stack }: StackContext) {
  const secrets = use(Secrets);
  const notifications = new Topic(stack, "notifications", {
    defaults: {
      function: {
        bind: [
          secrets.GOOGLE_CLIENT_ID,
          secrets.GOOGLE_CLIENT_SECRET,
          secrets.DATABASE_URL,
          secrets.DATABASE_AUTH_TOKEN,
        ],
      },
    },
    subscribers: {
      system: {
        function: {
          handler: "packages/functions/src/notifications/system.main",
          retryAttempts: 0,
          deadLetterQueueEnabled: false,
        },
      },
      user: {
        function: {
          handler: "packages/functions/src/notifications/user.main",
          retryAttempts: 0,
          deadLetterQueueEnabled: false,
        },
      },
      company: {
        function: {
          handler: "packages/functions/src/notifications/company.main",
          retryAttempts: 0,
          deadLetterQueueEnabled: false,
        },
      },
    },
  });

  stack.addOutputs({
    notificationsARN: notifications.topicArn,
    notificationsName: notifications.topicName,
  });

  return notifications;
}
