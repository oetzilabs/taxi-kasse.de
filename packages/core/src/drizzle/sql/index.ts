import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { migrate as mig } from 'drizzle-orm/aws-data-api/pg/migrator';
import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { RDS } from "sst/node/rds";
import { join } from 'path';
 
const rdsClient = new RDSDataClient({});
 
export const db = drizzle(rdsClient, {
  // @ts-ignore
  database: RDS.rds.defaultDatabaseName,
  // @ts-ignore
  secretArn: RDS.rds.secretArn,
  // @ts-ignore
  resourceArn: RDS.rds.clusterArn,
});

export const migrate = async () => {
  const p = join(process.cwd(), "packages/core/src/drizzle/migrations");
  return mig(db, { migrationsFolder: p });
};