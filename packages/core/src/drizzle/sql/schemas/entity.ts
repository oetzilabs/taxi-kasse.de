import { timestamp, uuid } from "drizzle-orm/pg-core";

export * as Entity from "./entity";

export const defaults = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
  }),
  deletedAt: timestamp("deleted_at", {
    mode: "date",
  }),
};
