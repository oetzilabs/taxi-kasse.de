import { RDS, StackContext } from "sst/constructs";

export function DatabaseStack({ stack, app }: StackContext) {
  const db = new RDS(stack, "rds", {
    defaultDatabaseName: app.name,
    engine: "postgresql13.9",
    scaling: {
      autoPause: true,
      minCapacity: "ACU_1",
      maxCapacity: "ACU_1",
    },
  });

  return {
    db,
  };
}
