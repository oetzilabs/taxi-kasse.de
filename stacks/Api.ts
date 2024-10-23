import { auth } from "./Auth";
import { cf, domain } from "./Domain";
import { allSecrets } from "./Secrets";

// import { storage } from "./Storage";

export const api = new sst.aws.ApiGatewayV2("Api", {
  domain: {
    name: `api.${domain}`,
    dns: cf,
  },
  cors: {
    allowOrigins: ["*", "http://localhost:3000"],
  },
});

const link = [
  // ws,
  // notifications,
  // storage,
  auth,
  ...allSecrets,
];

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

api.route("GET /healthcheck", {
  handler: "packages/functions/src/healthcheck.main",
  link,
  copyFiles,
});

api.route("GET /session", {
  handler: "packages/functions/src/session.handler",
  link,
  copyFiles,
});

api.route("POST /user/report/create", {
  handler: "packages/functions/src/user.createReport",
  link,
  copyFiles,
  timeout: "20 seconds",
});
