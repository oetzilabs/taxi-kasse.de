export * as Test from "./test";
import { z } from "zod";
import { db } from "./drizzle/sql";

import { event } from "./event";
import { users } from "./drizzle/sql/schema";

export const Events = {
  Created: event("test.created", {
    id: z.string(),
  }),
};

interface UserCreateInfo {
  name: string;
  email: string;
}

export async function create({ name, email }: UserCreateInfo) {
  console.log("Creating user", name);
  // write to database
  const [{ id }] = await db
    .insert(users)
    .values({
      email,
      name,
    })
    .returning();

  await Events.Created.publish({
    id,
  });
}

export async function list() {
  return db.select().from(users);
}
