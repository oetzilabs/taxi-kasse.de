import { Topic, StackContext, use, WebSocketApi } from "sst/constructs";
import { Secrets } from "./Secrets";
import { Domain } from "./Domain";
import { Notification } from "./Notification";

export function WebSocket({ stack }: StackContext) {
  const secrets = use(Secrets);
  const domain = use(Domain);
  const notifications = use(Notification);
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

  ws.bind([ws]);

  stack.addOutputs({
    ws: ws.customDomainUrl ?? ws.url,
  });

  return ws;
}
