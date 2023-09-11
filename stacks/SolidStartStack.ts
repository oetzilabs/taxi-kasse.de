import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { AuthStack } from "./AuthStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { auth } = use(AuthStack);
  const { bucket } = use(StorageStack);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth],
    path: "packages/frontend",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
      VITE_USER_POOL_CLIENT: auth.userPoolClientId,
      S3_BUCKET: bucket.bucketName,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.url || "localhost",
  });

  return {
    solidStartApp,
  };
}
