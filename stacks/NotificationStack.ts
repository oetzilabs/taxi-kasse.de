import { Topic, StackContext, use } from "sst/constructs";
import { SecretsStack } from "./SecretsStack";

export function NotificationStack({ stack }: StackContext) {
  const secrets = use(SecretsStack);
  const notifications = new Topic(stack, "notifications", {
    defaults: {
      function: {
        bind: [secrets.GOOGLE_CLIENT_ID, secrets.GOOGLE_CLIENT_SECRET, secrets.DATABASE_URL, secrets.DATABASE_AUTH_TOKEN],
      }
    },
    subscribers: {
      system: {
        function: {
          handler: "packages/functions/src/notifications/system.main"
        }
      },
      user: {
        function: {
          handler: "packages/functions/src/notifications/user.main"
        }
      },
      company: {
        function: {
          handler: "packages/functions/src/notifications/company.main"
        }
      }
    }
  });

  stack.addOutputs({
    notificationsARN: notifications.topicArn,
    notificationsName: notifications.topicName,
  });

  return {
    notifications,
  };
}

