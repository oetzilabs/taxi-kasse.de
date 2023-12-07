import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const domain = use(DNSStack);
  const { api, auth, GOOGLE_CLIENT_ID } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);
  const CallbackUrlBase = domain.domain.includes("dev") ? "http://localhost:3000" : `https://app.${domain.domain}`;
  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth, GOOGLE_CLIENT_ID],
    path: "packages/frontends/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
      VITE_AUTH_URL: auth.url,
      VITE_AUTH_REDIRECT_URL: `${CallbackUrlBase}/api/auth/callback`,
    },
    customDomain: {
      domainName: "app." + domain.domain,
      hostedZone: domain.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.url || "http://localhost:3000",
  });

  return {
    solidStartApp,
  };
}
