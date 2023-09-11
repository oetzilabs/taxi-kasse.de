import type { Config } from "drizzle-kit";

export default {
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/sql/schema.ts",
  verbose: true,
  driver: "pg",
  strict: true,
} satisfies Config;
