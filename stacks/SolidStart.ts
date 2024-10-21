import { api } from "./Api";
import { auth } from "./Auth";
import { cf, domain } from "./Domain";
import { realtime } from "./Realtime";
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
    realtime,
  ],
  path: "packages/web",
  buildCommand: "pnpm build",
  environment: {
    VITE_API_URL: api.url,
    VITE_APP_URL: main_app_url,
    VITE_AUTH_URL: auth.authenticator.url,
    VITE_LOGIN_REDIRECT_URI: `${main_app_url}/api/auth/callback`,
    VITE_MQTT_CONNECTION_STRING: realtime.endpoint,
    VITE_MQTT_AUTHORIZER: realtime.authorizer,
    VITE_REALTIME_TOPIC_PREFIX: `${$app.name}/${$app.stage}/`,
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
  permissions: [
    {
      actions: ["iot:Connect", "iot:Subscribe", "iot:Publish", "iot:Receive"],
      resources: ["*"],
    },
  ],
});
