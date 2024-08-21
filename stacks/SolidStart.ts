import { api } from "./Api";
import { auth } from "./Auth";
import { cf, domain } from "./Domain";
import { allSecrets } from "./Secrets";
// import { bucket } from "./Storage";
// import { ws } from "./Websocket";

const main_app_url = $dev ? "http://localhost:3000" : `https://www.${domain}`;

export const solidStartApp = new sst.aws.SolidStart(`SolidStartApp`, {
  link: [
    // bucket,
    // ws
    api,
    auth,
    ...allSecrets,
  ],
  path: "packages/web",
  buildCommand: "pnpm build",
  environment: {
    VITE_API_URL: api.url,
    VITE_APP_URL: main_app_url,
    VITE_AUTH_URL: auth.authenticator.url,
    // VITE_WS_LINK: ws.url,
  },
  domain: {
    name: `www.${domain}`,
    dns: cf,
  },
  invalidation: {
    paths: "all",
    wait: true,
  },
});
