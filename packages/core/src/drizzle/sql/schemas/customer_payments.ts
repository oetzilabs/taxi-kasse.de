import { relations } from "drizzle-orm";
import { decimal, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { users } from "./users";

export const customer_payments = commonTable(
  "customer_payments",
  {
    owner_id: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    charge: decimal("charge", { scale: 2 }).notNull().default("0.0"),
    tip: decimal("tip", { scale: 2 }).notNull().default("0.0"),
  },
  "customer_payment"
);

export type CustomerPaymentSelect = typeof customer_payments.$inferSelect;
export type CustomerPaymentInsert = typeof customer_payments.$inferInsert;

export const customer_payment_relation = relations(customer_payments, ({ one }) => ({
  owner: one(users, {
    fields: [customer_payments.owner_id],
    references: [users.id],
  }),
}));
