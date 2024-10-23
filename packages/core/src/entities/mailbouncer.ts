import { eq } from "drizzle-orm";
import {
  boolean,
  InferInput,
  InferOutput,
  intersect,
  object,
  optional,
  partial,
  picklist,
  safeParse,
  string,
} from "valibot";
import { db } from "../drizzle/sql";
import { mailbouncer, mailbouncer_type_values } from "../drizzle/sql/schemas/mailbouncer";
import { Validator } from "../validator";

export module MailBouncer {
  export const CreateSchema = object({
    email: string(),
    enabled: optional(boolean()),
    type: picklist(mailbouncer_type_values),
    t: string(),
    st: string(),
    locked: optional(boolean()),
  });

  export const BounceType = picklist(["Permanent", "Transient"]);

  export type BounceType = InferOutput<typeof BounceType>;

  export type SubType<T extends BounceType> = T extends "Permanent"
    ? readonly [
        "General",
        "NoEmailAddress",
        "Suppressed",
        "MailboxDoesNotExist",
        "MailboxUnavailable",
        "MessageContentRejected",
        "MessageRejected",
      ]
    : T extends "Transient"
      ? readonly [
          "General",
          "AttachmentRejected",
          "MailboxFull",
          "MessageTooLarge",
          "ContentRejected",
          "RecipientThrottled",
        ]
      : never;

  export const BounceSubType = <T extends InferOutput<typeof MailBouncer.BounceType>>(type: T) => {
    if (type === "Permanent") {
      return [
        "General",
        "NoEmailAddress",
        "Suppressed",
        "MailboxDoesNotExist",
        "MailboxUnavailable",
        "MessageContentRejected",
        "MessageRejected",
      ] as MailBouncer.SubType<"Permanent">;
    } else {
      return [
        "General",
        "AttachmentRejected",
        "MailboxFull",
        "MessageTooLarge",
        "ContentRejected",
        "RecipientThrottled",
      ] as MailBouncer.SubType<"Transient">;
    }
  };

  export type BounceSubType = ReturnType<typeof BounceSubType>;

  export type CombinedType<T extends BounceType> = T extends "Permanent"
    ? `${T}.${MailBouncer.SubType<"Permanent">[number]}`
    : T extends "Transient"
      ? `${T}.${MailBouncer.SubType<"Transient">[number]}`
      : never;

  export const isValidBounceType = (s: string) => {
    return safeParse(BounceType, s);
  };

  export const isValidBounceSubType = (t: InferOutput<typeof BounceType>, s: string) => {
    return safeParse(picklist(BounceSubType(t)), s);
  };

  export const UpdateSchema = intersect([partial(MailBouncer.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.mailbouncer.findFirst>[0]>["with"];
  export const _with: WithOptions = {};

  export type Info = NonNullable<Awaited<ReturnType<typeof MailBouncer.findById>>>;

  export const create = async (data: InferInput<typeof MailBouncer.CreateSchema>, tsx = db) => {
    const isValid = safeParse(MailBouncer.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(mailbouncer).values(isValid.output).returning();
    const order = await MailBouncer.findById(created.id);
    return order!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.mailbouncer.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findByEmail = async (
    email: InferInput<(typeof MailBouncer.CreateSchema)["entries"]["email"]>,
    tsx = db,
  ) => {
    const isValid = safeParse(MailBouncer.CreateSchema.entries.email, email);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.mailbouncer.findFirst({
      where: (fields, ops) => ops.eq(fields.email, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof MailBouncer.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(MailBouncer.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [updated] = await tsx
      .update(mailbouncer)
      .set(isValid.output)
      .where(eq(mailbouncer.id, isValid.output.id))
      .returning();
    const u = await findById(updated.id, tsx);
    return u!;
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(mailbouncer).where(eq(mailbouncer.id, isValid.output)).returning();
  };

  export const all = async (tsx = db) => {
    const mailbouncer = await tsx.query.mailbouncer.findMany({
      with: _with,
    });
    return mailbouncer;
  };

  export const allNonDeleted = async (tsx = db) => {
    const mailbouncer = await tsx.query.mailbouncer.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      orderBy(fields, ops) {
        return [ops.desc(fields.createdAt)];
      },
      with: _with,
    });
    return mailbouncer;
  };
}
