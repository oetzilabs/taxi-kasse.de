import { allSecrets, secret } from "./Secrets";

export const migrate = new sst.x.DevCommand("DatabaseMigrate", {
  dev: {
    command: "pnpm drizzle-kit migrate",
    directory: "packages/core",
    autostart: false,
  },
  link: [secret.SECRET_DATABASE_URL, secret.SECRET_DATABASE_PROVIDER],
});

export const generate = new sst.x.DevCommand("DatabaseGenerate", {
  dev: {
    command: "pnpm drizzle-kit generate",
    directory: "packages/core",
    autostart: false,
  },
  link: [secret.SECRET_DATABASE_URL, secret.SECRET_DATABASE_PROVIDER],
});

export const studio = new sst.x.DevCommand("DatabaseStudio", {
  dev: {
    command: "pnpm drizzle-kit studio",
    directory: "packages/core",
    autostart: false,
  },
  link: [secret.SECRET_DATABASE_URL, secret.SECRET_DATABASE_PROVIDER],
});
