import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";

export const websockets = sqliteTable("websockets", {
  ...Entity.defaults,
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  connectionId: text("connection_id").notNull(),
});

export type WebsocketsSelect = typeof websockets.$inferSelect;
export type WebsocketsInsert = typeof websockets.$inferInsert;

export const websocketsRelation = relations(websockets, ({ one, many }) => ({
  user: one(users, {
    fields: [websockets.userId],
    references: [users.id],
  }),
}));
