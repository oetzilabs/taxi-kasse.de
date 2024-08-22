import { relations } from "drizzle-orm";
import { decimal, text, timestamp } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { rides } from "./rides";
import { users } from "./users";
import { schema } from "./utils";

export const verificationStatus = schema.enum("verification_status", ["pending", "verified", "rejected"]);

export const verifications = commonTable(
  "verifications",
  {
    owner_id: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    status: verificationStatus("status").notNull().default("pending"),
  },
  "verification",
);

export type VerificationSelect = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;

export const verification_relation = relations(verifications, ({ one, many }) => ({
  owner_id: one(users, {
    fields: [verifications.owner_id],
    references: [users.id],
  }),
}));
