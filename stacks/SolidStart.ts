import { api } from "./Api";
import { auth } from "./Auth";
import { cf, domain } from "./Domain";
import { mainEmail } from "./Email";
import { realtime } from "./Realtime";
import { allSecrets } from "./Secrets";

const main_app_url = $dev ? "http://localhost:3000" : $interpolate`https://${domain}`;

export const solidStartApp = new sst.aws.SolidStart(`SolidStartApp`, {
  link: [...allSecrets, api, auth, realtime, mainEmail],
  path: "packages/web",
  environment: {
    VITE_API_URL: api.url,
    VITE_APP_URL: main_app_url,
    VITE_AUTH_URL: auth.url,
    VITE_LOGIN_REDIRECT_URI: $interpolate`${main_app_url}/api/auth/callback`,
    VITE_MQTT_CONNECTION_STRING: realtime.endpoint,
    VITE_MQTT_AUTHORIZER: realtime.authorizer,
    VITE_REALTIME_TOPIC_PREFIX: $interpolate`${$app.name}/${$app.stage}/`,
    // VITE_WS_LINK: ws.url,
  },
  domain: {
    name: domain,
    aliases: [`www.${domain}`],
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
    {
      actions: ["ses:SendEmail"],
      resources: ["*"],
    },
  ],
});
