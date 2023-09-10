import { StackContext, Api, RDS, EventBus } from "sst/constructs";

export function API({ stack, app }: StackContext) {
  
  
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const db = new RDS(stack, "rds", {
    defaultDatabaseName: "taxikasse",
    engine: "postgresql13.9",
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [bus, db],
        copyFiles: [
          {
            from: 'packages/core/src/drizzle',
            to: 'drizzle',
          },
        ],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /test-test": "packages/functions/src/test.test",
      "GET /home": "packages/functions/src/home.main",
      "GET /test": "packages/functions/src/test.list",
      "POST /test": "packages/functions/src/test.create",
      "POST /migrate": "packages/functions/src/migrator.handler",
    },
  });

  bus.subscribe("test.created", {
    handler: "packages/functions/src/events/test-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
