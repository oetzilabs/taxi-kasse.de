import type { Config } from "drizzle-kit";
import { RDS } from "sst/node/rds";

export default {
  out: "./src/drizzle/migrations/",
  schema: "./src/drizzle/**/*.sql.ts",
  verbose: true,
  driver: "pg",
} satisfies Config;