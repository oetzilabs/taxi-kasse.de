import { SolidStartSite, StackContext, use } from "sst/constructs";
import { API } from "./Api";
// import { DatabaseStack } from "./DatabaseStack";
import { Storage } from "./Storage";
import { Domain } from "./Domain";
import { Secrets } from "./Secrets";
import { Notification } from "./Notification";
import { WebSocket } from "./WebSocket";

export function SolidStart({ stack, app }: StackContext) {
  const domain = use(Domain);
  const { api, auth } = use(API);
  const secrets = use(Secrets);
  const bucket = use(Storage);
  const notifications = use(Notification);
  const ws = use(WebSocket);

  const CallbackUrlBase = domain.domain.includes("dev") ? "http://localhost:3000" : `https://app.${domain.domain}`;

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth, notifications, secrets.GOOGLE_CLIENT_ID],
    path: "packages/frontends/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
      VITE_AUTH_URL: auth.url,
      VITE_AUTH_REDIRECT_URL: `${CallbackUrlBase}/api/auth/callback`,
      VITE_NOTIFICATION_WS_URL: ws.customDomainUrl ?? ws.url,
    },
    customDomain: {
      domainName: "app." + domain.domain,
      hostedZone: domain.zone.zoneName,
    },
  });

  const solidStartMain = new SolidStartSite(stack, `${app.name}-main`, {
    bind: [bucket, api, auth, notifications, secrets.GOOGLE_CLIENT_ID],
    path: "packages/frontends/main",
    buildCommand: "pnpm build",
    environment: {
      VITE_APP_URL: (solidStartApp.customDomainUrl ?? solidStartApp.url) || "http://localhost:3000",
    },
    customDomain: {
      domainName: domain.domain,
      domainAlias: `www.${domain.domain}`,
      hostedZone: domain.zone.zoneName,
    },
  });

  stack.addOutputs({
    AppSiteUrl: (solidStartApp.customDomainUrl ?? solidStartApp.url) || "http://localhost:3000",
    MainSiteUrl: (solidStartMain.customDomainUrl ?? solidStartMain.url) || "http://localhost:4000",
    CallbackUrlBase,
  });

  return {
    solidStartApp,
    solidStartMain,
  };
}
