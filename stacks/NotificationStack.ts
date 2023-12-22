import { Topic, StackContext, use, WebSocketApi } from "sst/constructs";
import { SecretsStack } from "./SecretsStack";
import { DNSStack } from "./DNSStack";

export function NotificationStack({ stack }: StackContext) {
  const secrets = use(SecretsStack);
  const domain = use(DNSStack);
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

  const ws = new WebSocketApi(stack, "ws", {
    customDomain: {
      domainName: "ws." + domain.domain,
      hostedZone: domain.zone.zoneName,
    },
    defaults: {
      function: {
        bind: [
          notifications,
          secrets.GOOGLE_CLIENT_ID,
          secrets.GOOGLE_CLIENT_SECRET,
          secrets.DATABASE_URL,
          secrets.DATABASE_AUTH_TOKEN,
        ],
      },
    },
    routes: {
      $default: {
        function: {
          handler: "packages/functions/src/ws.main",
          description: "This is the main function",
        },
      },
      $connect: {
        function: {
          handler: "packages/functions/src/ws.connect",
          description: "This is the connect function",
        },
      },
      $disconnect: {
        function: {
          handler: "packages/functions/src/ws.disconnect",
          description: "This is the disconnect function",
        },
      },
      sendnotification: {
        function: {
          handler: "packages/functions/src/ws.sendnotification",
          description: "This is the sendnotification function",
        },
      },
      ping: {
        function: {
          handler: "packages/functions/src/ws.ping",
          description: "This is the ping function",
        },
      },
    },
  });

  stack.addOutputs({
    notificationsARN: notifications.topicArn,
    notificationsName: notifications.topicName,
    ws: ws.customDomainUrl ?? ws.url,
  });

  return { notifications, ws };
}
