import { eq } from "drizzle-orm";
import { date, InferInput, object, omit, partial, pipe, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { daily_records, DailyRecordsCreateSchema } from "../drizzle/sql/schemas/daily_records";
import { Validator } from "../validator";

export module Calendar {
  export const Create = omit(DailyRecordsCreateSchema, [
    "created_by",
    "company_id",
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ]);

  export type Creator = InferInput<typeof Calendar.Create>;

  export const UpdateSchema = object({
    ...partial(DailyRecordsCreateSchema).entries,
    id: Validator.Cuid2Schema,
  });

  export type Updater = InferInput<typeof Calendar.UpdateSchema>;

  export type WithOptions = NonNullable<Parameters<typeof db.query.daily_records.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    createdBy: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Calendar.findById>>>;

  export const create = async (data: InferInput<typeof DailyRecordsCreateSchema>, tsx = db) => {
    const isValid = safeParse(DailyRecordsCreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(daily_records).values(isValid.output).returning();
    const order = await Calendar.findById(created.id);
    return order!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.daily_records.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findEntriesByUserIdAndCompanyId = async (
    id: InferInput<typeof Validator.Cuid2Schema>,
    cid: InferInput<typeof Validator.Cuid2Schema>,
    dates: {
      from: Date;
      to: Date;
    },
    tsx = db,
  ) => {
    const is_valid_user_id = safeParse(Validator.Cuid2Schema, id);
    if (!is_valid_user_id.success) {
      throw is_valid_user_id.issues;
    }
    const is_valid_company_id = safeParse(Validator.Cuid2Schema, cid);
    if (!is_valid_company_id.success) {
      throw is_valid_company_id.issues;
    }

    return tsx.query.daily_records.findMany({
      where: (fields, ops) =>
        ops.and(
          ops.eq(fields.created_by, is_valid_user_id.output),
          ops.eq(fields.company_id, is_valid_company_id.output),
          ops.gte(fields.date, dates.from),
          ops.lte(fields.date, dates.to),
          ops.isNull(fields.deletedAt),
        ),
      orderBy(fields, ops) {
        return [ops.desc(fields.date)];
      },
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Calendar.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Calendar.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [updated] = await tsx
      .update(daily_records)
      .set(isValid.output)
      .where(eq(daily_records.id, isValid.output.id))
      .returning();
    const u = await findById(updated.id, tsx);
    return u!;
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(daily_records).where(eq(daily_records.id, isValid.output)).returning();
  };

  export const all = async (tsx = db) => {
    const daily_records = await tsx.query.daily_records.findMany({
      with: _with,
    });
    return daily_records;
  };

  export const allNonDeleted = async (tsx = db) => {
    const daily_records = await tsx.query.daily_records.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      orderBy(fields, ops) {
        return [ops.desc(fields.createdAt)];
      },
      with: _with,
    });
    return daily_records;
  };

  export const findByDateCompanyUser = async (
    d: Date,
    company_id: InferInput<typeof Validator.Cuid2Schema>,
    user_id: InferInput<typeof Validator.Cuid2Schema>,
    tsx = db,
  ) => {
    const is_valid_company_id = safeParse(Validator.Cuid2Schema, company_id);
    if (!is_valid_company_id.success) {
      throw is_valid_company_id.issues;
    }
    const is_valid_user_id = safeParse(Validator.Cuid2Schema, user_id);
    if (!is_valid_user_id.success) {
      throw is_valid_user_id.issues;
    }
    return tsx.query.daily_records.findFirst({
      where: (fields, ops) =>
        ops.and(
          ops.eq(fields.date, d),
          ops.eq(fields.company_id, is_valid_company_id.output),
          ops.eq(fields.created_by, is_valid_user_id.output),
        ),
      with: _with,
    });
  };
}
