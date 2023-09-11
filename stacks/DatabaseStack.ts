import { StackContext, Api, RDS, EventBus } from "sst/constructs";

export function DatabaseStack({ stack, app }: StackContext) {
  const db = new RDS(stack, "rds", {
    defaultDatabaseName: app.name,
    engine: "postgresql13.9",
  });

  return {
    db,
  };
}
