import { StackContext, Api, RDS, EventBus, use } from "sst/constructs";
import { DatabaseStack } from "./DatabaseStack";
import { EventBusStack } from "./EventBusStack";

export function ApiStack({ stack, app }: StackContext) {
  // const { bus } = use(EventBusStack);
  const { db } = use(DatabaseStack);

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        // handler: "packages/functions/src/migrator.handler",
        bind: [
          // bus,
          db,
        ],
        copyFiles: [
          {
            from: "packages/core/src/drizzle",
            to: "drizzle",
          },
        ],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /open": "packages/functions/src/open.handler",
      "POST /migrate": "packages/functions/src/migrator.handler",
      "POST /create": "packages/functions/src/user.create",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
  };
}
