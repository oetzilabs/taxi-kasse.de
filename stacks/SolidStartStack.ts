import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { AuthStack } from "./AuthStack";
import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  const { db } = use(DatabaseStack);
  const { auth } = use(AuthStack);
  const { bucket } = use(StorageStack);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    path: "./packages/web/workspace",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
      VITE_USER_POOL_CLIENT: auth.userPoolClientId,
      VITE_S3_BUCKET: bucket.bucketArn,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.url,
  });

  return {
    solidStartApp,
  };
}
