import { migrate } from "@taxi-kassede/core/drizzle/sql";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async (_evt) => {
  await migrate();

  return {
    body: "Migrated!",
  };
});
