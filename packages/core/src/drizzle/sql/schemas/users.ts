import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";

export const users = pgTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
