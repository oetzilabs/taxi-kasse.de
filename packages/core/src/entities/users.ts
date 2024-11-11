import { eq } from "drizzle-orm";
import { date, InferInput, intersect, nullable, object, optional, partial, picklist, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { user_role } from "../drizzle/sql/schema";
import { currency_code, users } from "../drizzle/sql/schemas/users";
import { Validator } from "../validator";

export module Users {
  export const CreateSchema = object({
    name: string(),
    email: Validator.EmailSchema,
    image: optional(nullable(string())),
    verifiedAt: optional(nullable(date())),
    role: optional(picklist(user_role.enumValues)),
    currency_code: optional(picklist(currency_code.enumValues)),
    referral_code: optional(nullable(string())),
  });
  export const UpdateSchema = intersect([partial(Users.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.users.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    orgs: {
      with: {
        user: true,
      },
    },
    companies: {
      with: {
        user: true,
      },
    },

    sessions: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Users.findById>>>;

  export const create = async (data: InferInput<typeof Users.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Users.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(users).values(isValid.output).returning();
    const user = await Users.findById(created.id)!;
    return user;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.users.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: {
        ..._with,
        vehicles: {
          with: {
            model: true,
          },
        },
      },
    });
  };

  export const findByEmail = async (_email: string, tsx = db) => {
    const isValid = safeParse(Validator.EmailSchema, _email);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.users.findFirst({
      where: (fields, ops) => ops.eq(fields.email, isValid.output),
      with: {
        ..._with,
        vehicles: {
          with: {
            model: true,
          },
        },
      },
    });
  };

  export const update = async (data: InferInput<typeof Users.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Users.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(users).set(isValid.output).where(eq(users.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(users).where(eq(users.id, isValid.output)).returning();
  };

  export const getPreferredCurrencyByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }

    const convert_currency_to_symbol: Record<
      (typeof currency_code.enumValues)[number],
      {
        prefix: string;
        sufix: string;
        code: (typeof currency_code.enumValues)[number];
      }
    > = {
      USD: { prefix: "$", sufix: "USD", code: "USD" },
      EUR: { prefix: "", sufix: "€", code: "EUR" },
      GBP: { prefix: "", sufix: "£", code: "GBP" },
      CHF: { prefix: "", sufix: "CHF", code: "CHF" },
      JPY: { prefix: "¥", sufix: "JPY", code: "JPY" },
      AUD: { prefix: "$", sufix: "AUD", code: "AUD" },
      CAD: { prefix: "$", sufix: "CAD", code: "CAD" },
      NZD: { prefix: "$", sufix: "NZD", code: "NZD" },
    };

    const result = await tsx.select({ currency: users.currency_code }).from(users).where(eq(users.id, isValid.output));

    if (result.length === 0) return convert_currency_to_symbol.USD;

    return convert_currency_to_symbol[result[0].currency];
  };
}
