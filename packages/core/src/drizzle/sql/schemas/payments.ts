import { UnitTypeLong, UnitTypeLongPlural } from "dayjs";
import { relations } from "drizzle-orm";
import { integer, json, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { users } from "./users";

type ExcludedInterval = "millisecond" | "second" | "date";
type ExcludedIntervalPlural = ExcludedInterval | `${ExcludedInterval}s`;
type IntervalSingular = Exclude<UnitTypeLong, ExcludedInterval>;
type IntervalPlural = Exclude<UnitTypeLongPlural, ExcludedIntervalPlural>;
type NotOne<T> = T extends 1 ? never : T;
type Intervals = `1 ${IntervalSingular}` | `${NotOne<number>} ${IntervalPlural}`;

export const payments = commonTable(
  "payments",
  {
    owner_id: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    reoccuring: json("reoccuring").$type<{
      startsAt: Date;
      endsAt?: Date;
      interval: Intervals;
    }>(),
  },
  "payment"
);

export type PaymentSelect = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;

export const payment_relation = relations(payments, ({ one }) => ({
  owner: one(users, {
    fields: [payments.owner_id],
    references: [users.id],
  }),
}));
