import { StackContext, Config } from "sst/constructs";

export function Secrets({ stack, app }: StackContext) {
  const secrets = Config.Secret.create(
    stack,
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DATABASE_URL",
    "DATABASE_AUTH_TOKEN"
  );

  return secrets;
}
