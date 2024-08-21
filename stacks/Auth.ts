import { domain } from "./Domain";
import { allSecrets } from "./Secrets";

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

export const auth = new sst.aws.Auth(`Auth`, {
  authenticator: {
    handler: "packages/functions/src/auth.handler",
    link: [...allSecrets],
    environment: {
      AUTH_FRONTEND_URL: $dev ? "http://localhost:3000" : "https://" + domain,
      EMAIL_DOMAIN: domain,
    },
    runtime: "nodejs20.x",
    copyFiles,
  },
});
