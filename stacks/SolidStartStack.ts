import { Config, SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const { api, auth, GOOGLE_CLIENT_ID } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth, GOOGLE_CLIENT_ID],
    path: "packages/frontend",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
      S3_BUCKET: bucket.bucketName,
      VITE_AUTH_URL: auth.url,
      SESSION_SECRET: "If6GaTGzindzw04Zx/coub4Lk1gRLX2hO1CcFmkhKSs=",
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.url || "http://localhost:3000",
  });

  return {
    solidStartApp,
  };
}
