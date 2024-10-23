import { relations } from "drizzle-orm";
import { boolean, text } from "drizzle-orm/pg-core";
import { commonTable } from "./entity";
import { schema } from "./utils";

// aws bouncer types
export const mailbouncer_type = schema.enum("mailbouncer_type", [
  // Transient bounces (Temporary issues that might be resolved on retry)
  "Transient.General",
  "Transient.AttachmentRejected",
  "Transient.MailboxFull",
  "Transient.MessageTooLarge",
  "Transient.ContentRejected",
  "Transient.RecipientThrottled",

  // Permanent bounces (Indicates a permanent issue, should not retry)
  "Permanent.General",
  "Permanent.NoEmailAddress",
  "Permanent.Suppressed",
  "Permanent.MailboxDoesNotExist",
  "Permanent.MailboxUnavailable",
  "Permanent.MessageContentRejected",
  "Permanent.MessageRejected",

  // Undetermined (The type couldn't be identified)
  "Undetermined",
]);

export const mailbouncer = commonTable(
  "mailbouncer",
  {
    email: text("email").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    type: mailbouncer_type("type").notNull(),
    t: text("t").notNull(),
    st: text("st").notNull(),
    locked: boolean("locked").notNull().default(false),
  },
  "mailbouncer",
);

export type MailBouncerSelect = typeof mailbouncer.$inferSelect;
export type MailBouncerInsert = typeof mailbouncer.$inferInsert;

export const mailbouncer_relation = relations(mailbouncer, ({ one }) => ({}));

export const mailbouncer_type_values = mailbouncer_type.enumValues;
export type MailBouncerType = (typeof mailbouncer_type.enumValues)[number];
