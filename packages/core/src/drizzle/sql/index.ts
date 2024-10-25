import { join } from "node:path";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate as mig } from "drizzle-orm/neon-http/migrator";
import { drizzle as localDrizzle } from "drizzle-orm/node-postgres";
import { migrate as localMigrate } from "drizzle-orm/node-postgres/migrator";
import Pool from "pg-pool";
import { Resource } from "sst";
import * as schema from "./schema";

export const database = () => {
  if (Resource.DatabaseProvider.value === "local") {
    const localClient = new Pool({
      connectionString: Resource.DatabaseUrl.value,
    });
    return localDrizzle(localClient, { schema });
  } else {
    const client = neon(Resource.DatabaseUrl.value);
    return drizzle(client, {
      schema,
    });
  }
};

export const db = database();

export async function createTransaction<T extends typeof db>(cb: (trx: T) => void) {
  await db.transaction(cb as any);
}

export const migrate = async () => {
  const config = {
    migrationsFolder: join(process.cwd(), "drizzle/migrations"),
  };
  if (Resource.DatabaseProvider.value === "local") {
    console.log("Migrating local database: " + Resource.DatabaseUrl.value);
    const localClient = new Pool({
      connectionString: Resource.DatabaseUrl.value,
    });
    const db = localDrizzle(localClient, { schema });
    return localMigrate(db, config);
  } else {
    console.log("Migrating PROD database: " + Resource.DatabaseUrl.value);
    const client = neon(Resource.DatabaseUrl.value);
    const db = drizzle(client, {
      schema,
    });
    return mig(db, config);
  }
};

export const luciaAdapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);
