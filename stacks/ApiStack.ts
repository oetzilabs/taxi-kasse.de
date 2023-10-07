import { Api, Config, StackContext, use } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const secrets = Config.Secret.create(
    stack,
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DATABASE_URL",
    "DATABASE_AUTH_TOKEN"
  );

  const { bucket } = use(StorageStack);

  const auth = new Auth(stack, "auth", {
    authenticator: {
      bind: [secrets.GOOGLE_CLIENT_ID, secrets.GOOGLE_CLIENT_SECRET, secrets.DATABASE_URL, secrets.DATABASE_AUTH_TOKEN],
      handler: "packages/functions/src/auth.handler",
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        // handler: "packages/functions/src/migrator.handler",
        bind: [secrets.GOOGLE_CLIENT_ID, auth, secrets.DATABASE_URL, secrets.DATABASE_AUTH_TOKEN, bucket],
        copyFiles: [
          {
            from: "packages/core/src/drizzle",
            to: "drizzle",
          },
          {
            from: "node_modules/@sparticuz/chromium/bin",
            to: "packages/functions/bin",
          },
        ],
      },
    },
    routes: {
      "GET /": {
        function: {
          handler: "packages/functions/src/lambda.handler",
          description: "This is the default function",
        },
      },
      "GET /healthcheck": {
        function: {
          handler: "packages/functions/src/healthcheck.main",
          description: "This is the healthcheck function",
        },
      },
      "GET /data": {
        function: {
          handler: "packages/functions/src/data.handler",
          description: "This is the data function, which handles all data requests for the frontend",
        },
      },
      "GET /session": {
        function: {
          handler: "packages/functions/src/session.handler",
          description: "This is the session function",
        },
      },
      "GET /open": {
        function: {
          handler: "packages/functions/src/open.handler",
          description:
            "This is the function to view all visible data about the application, since this will be an OpenSource Application at some point",
        },
      },
      "POST /migrate": {
        function: {
          handler: "packages/functions/src/migrator.handler",
          description: "This is the migrator function",
        },
      },
      "POST /user/create": {
        function: {
          handler: "packages/functions/src/user.create",
          description: "This is the user creation function",
        },
      },
      "POST /company/create": {
        function: {
          handler: "packages/functions/src/company.create",
          description: "This is the company creation function",
        },
      },
      "GET /user/all": {
        function: {
          handler: "packages/functions/src/user.listAll",
          description: "This is the user listAll function",
        },
      },
      "GET /user/company": {
        function: {
          handler: "packages/functions/src/user.company",
          description: "This is the user company function",
        },
      },
      "GET /user/calendar": {
        function: {
          handler: "packages/functions/src/user.calendar",
          description: "This is the user calendar function",
        },
      },
      "GET /user/report/list": {
        function: {
          handler: "packages/functions/src/user.listReports",
          description: "This is the user listReports function",
        },
      },
      "POST /user/report/create": {
        function: {
          handler: "packages/functions/src/user.createReport",
          description: "This is the user createReport function",
          timeout: 29,
        },
      },
      "POST /user/day_entry/create": {
        function: {
          handler: "packages/functions/src/user.createDayEntry",
          description: "This is the user createDayEntry function",
        },
      },
      "POST /user/day_entry/update": {
        function: {
          handler: "packages/functions/src/user.updateDayEntry",
          description: "This is the user updateDayEntry function",
        },
      },
      "POST /user/day_entry/delete": {
        function: {
          handler: "packages/functions/src/user.deleteDayEntry",
          description: "This is the user deleteDayEntry function",
        },
      },
      "GET /user/statistics": {
        function: {
          handler: "packages/functions/src/user.statistics",
          description: "This is the user statistics function",
        },
      },
      "GET /user/hasCompany": {
        function: {
          handler: "packages/functions/src/user.hasCompany",
          description: "This is the user hasCompany function",
        },
      },
      "GET /company/statistics": {
        function: {
          handler: "packages/functions/src/company.statistics",
          description: "This is the company statistics function",
        },
      },
      "GET /company/all": {
        function: {
          handler: "packages/functions/src/company.listAll",
          description: "This is the company listAll function",
        },
      },
      "GET /company/search": {
        function: {
          handler: "packages/functions/src/company.search",
          description: "This is the company search function",
        },
      },
    },
    cors: {
      allowOrigins: ["*", "http://localhost:3000"],
    },
  });

  new Config.Parameter(stack, "APP_URL", {
    value: api.url,
  });

  new Config.Parameter(stack, "AUTH_URL", {
    value: auth.url,
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    AuthEndpoint: auth.url,
  });

  return {
    api,
    auth,
    GOOGLE_CLIENT_ID: secrets.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: secrets.GOOGLE_CLIENT_SECRET,
  };
}
