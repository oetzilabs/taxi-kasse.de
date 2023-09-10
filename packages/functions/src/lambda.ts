import { ApiHandler } from "sst/node/api";
import { db } from "@taxi-kassede/core/drizzle/sql";
import { users } from "../../core/src/drizzle/sql/schema";

export const handler = ApiHandler(async (_evt) => {
  const response = await db.select().from(users);
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response, null, 2),
  };
});