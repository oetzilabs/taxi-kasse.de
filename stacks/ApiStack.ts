import { Api, Config, StackContext, use } from "sst/constructs";
import { DatabaseStack } from "./DatabaseStack";
import { Auth } from "sst/constructs";

export function ApiStack({ stack }: StackContext) {
  const { db } = use(DatabaseStack);

  const secrets = Config.Secret.create(stack, "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");

  const auth = new Auth(stack, "auth", {
    authenticator: {
      bind: [secrets.GOOGLE_CLIENT_ID, secrets.GOOGLE_CLIENT_SECRET],
      handler: "packages/functions/src/auth.handler",
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        // handler: "packages/functions/src/migrator.handler",
        bind: [secrets.GOOGLE_CLIENT_ID, db, auth],
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

  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  new Config.Parameter(stack, "APP_URL", {
    value: api.url,
  });

  new Config.Parameter(stack, "AUTH_URL", {
    value: api.url + "/auth",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    AuthEndpoint: api.url + "/auth",
  });

  return {
    api,
    auth,
    GOOGLE_CLIENT_ID: secrets.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: secrets.GOOGLE_CLIENT_SECRET,
  };
}
