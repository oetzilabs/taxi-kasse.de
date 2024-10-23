import { eq } from "drizzle-orm";
import {
  boolean,
  date,
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
import { mailcomplaint, mailcomplaint_type_values } from "../drizzle/sql/schemas/mailcomplaint";
import { Validator } from "../validator";

export module MailComplaint {
  export const CreateSchema = object({
    email: string(),
    enabled: optional(boolean()),
    type: picklist(mailcomplaint_type_values),
    t: string(),
    complaintTimestamp: date(),
    feedbackId: string(),
    locked: optional(boolean()),
  });

  export const ComplaintType = picklist(mailcomplaint_type_values);

  export type ComplaintType = InferOutput<typeof ComplaintType>;

  export const UpdateSchema = intersect([partial(MailComplaint.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.mailcomplaint.findFirst>[0]>["with"];
  export const _with: WithOptions = {};

  export const create = async (data: InferInput<typeof MailComplaint.CreateSchema>, tsx = db) => {
    const isValid = safeParse(MailComplaint.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(mailcomplaint).values(isValid.output).returning();
    return created!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.mailcomplaint.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findByEmail = async (
    email: InferInput<(typeof MailComplaint.CreateSchema)["entries"]["email"]>,
    tsx = db,
  ) => {
    const isValid = safeParse(MailComplaint.CreateSchema.entries.email, email);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.mailcomplaint.findFirst({
      where: (fields, ops) => ops.eq(fields.email, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof MailComplaint.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(MailComplaint.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [updated] = await tsx
      .update(mailcomplaint)
      .set(isValid.output)
      .where(eq(mailcomplaint.id, isValid.output.id))
      .returning();
    return updated!;
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(mailcomplaint).where(eq(mailcomplaint.id, isValid.output)).returning();
  };

  export const all = async (tsx = db) => {
    return tsx.query.mailcomplaint.findMany({
      with: _with,
    });
  };

  export const allNonDeleted = async (tsx = db) => {
    return tsx.query.mailcomplaint.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      orderBy(fields, ops) {
        return [ops.desc(fields.createdAt)];
      },
      with: _with,
    });
  };

  export const isValidComplaintType = (s: string) => safeParse(MailComplaint.ComplaintType, s);
}
