import { cf, domain } from "./Domain";
// import { mainEmailWorker } from "./Email";
import { allSecrets } from "./Secrets";

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

export const auth = new sst.aws.Auth(`Auth`, {
  authorizer: {
    handler: "packages/functions/src/auth.handler",
    link: [
      ...allSecrets,
      // mainEmailWorker
    ],
    environment: {
      AUTH_FRONTEND_URL: $dev ? "http://localhost:3000" : "https://" + domain,
      EMAIL_DOMAIN: domain,
    },
    runtime: "nodejs22.x",
    copyFiles,
  },
  domain: {
    name: $interpolate`auth.${domain}`,
    dns: cf,
  }
});
