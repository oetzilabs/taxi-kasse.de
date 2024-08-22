import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { email, InferInput, omit, pipe, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { users } from "../drizzle/sql/schemas/users";
import { Validator } from "../validator";

export module Users {
  export const CreateSchema = createInsertSchema(users);
  export const UpdateSchema = omit(
    createInsertSchema(users, {
      id: Validator.Cuid2Schema,
    }),
    ["createdAt", "updatedAt"],
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.users.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    orgs: {
      with: {
        organization: {
          with: {},
        },
        user: true,
      },
    },
    sessions: true,
  };

  export const create = async (data: InferInput<typeof Users.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Users.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(users).values(isValid.output).returning();
    const user = Users.findById(created.id);
    return user!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return db.query.users.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const findByEmail = async (_email: string, tsx = db) => {
    const isValid = safeParse(Validator.EmailSchema, _email);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.users.findFirst({
      where: (fields, ops) => ops.eq(fields.email, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Users.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Users.UpdateSchema, data.id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(users).set(isValid.output).where(eq(users.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(pipe(string(), Validator.Cuid2Schema), id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return db.delete(users).where(eq(users.id, isValid.output)).returning();
  };
}
