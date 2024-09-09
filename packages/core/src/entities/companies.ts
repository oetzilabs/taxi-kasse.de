import { desc, eq } from "drizzle-orm";
import { InferInput, intersect, nullable, object, omit, optional, partial, pipe, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { companies } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Companies {
  export const CreateSchema = object({
    ownerId: nullable(Validator.Cuid2Schema),
    name: string(),
    email: string(),
    phoneNumber: optional(nullable(string())),
    image: optional(string()),
    banner: optional(string()),
    website: optional(nullable(string())),
    uid: string(),
  });

  export const CreateWithoutOwnerSchema = omit(CreateSchema, ["ownerId"]);

  export const UpdateSchema = intersect([partial(Companies.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.companies.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    owner: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Companies.findById>>>;

  export const create = async (data: InferInput<typeof Companies.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Companies.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(companies).values([isValid.output]).returning();
    const org = await Companies.findById(created.id);
    return org!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid) throw new Error("Invalid id");
    return tsx.query.companies.findFirst({
      where: (fields, ops) => ops.eq(fields.id, id),
      with: {
        ...Companies._with,
        regions: {
          with: {
            region: true,
          },
        },
        employees: {
          with: { user: true },
        },
        discounts: {
          with: {
            discount: true,
          },
        },
      },
    });
  };

  export const findByName = async (name: string, tsx = db) => {
    return tsx.query.companies.findFirst({
      where: (fields, ops) => ops.eq(fields.name, name),
      with: {
        ...Companies._with,
        regions: {
          with: {
            region: true,
          },
        },
        employees: {
          with: { user: true },
        },
        discounts: {
          with: {
            discount: true,
          },
        },
      },
    });
  };

  export const findByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.companies.findMany({
      where: (fields, ops) => ops.eq(fields.ownerId, isValid.output),
      with: {
        ...Companies._with,
        regions: {
          with: {
            region: true,
          },
        },
        employees: {
          with: { user: true },
        },
        discounts: {
          with: {
            discount: true,
          },
        },
      },
    });
  };

  export const lastCreatedByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.companies.findFirst({
      where: (fields, ops) => ops.eq(fields.ownerId, isValid.output),
      orderBy: [desc(companies.createdAt)],
      with: {
        ...Companies._with,
        regions: {
          with: {
            region: true,
          },
        },
        employees: {
          with: { user: true },
        },
        discounts: {
          with: {
            discount: true,
          },
        },
      },
    });
  };

  export const discounts = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    const entries = await tsx.query.company_discounts.findMany({
      where: (fields, ops) => ops.eq(fields.company_id, isValid.output),
      with: {
        discount: true,
      },
    });

    return entries.map((org) => org.discount);
  };

  export const update = async (data: InferInput<typeof UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Companies.UpdateSchema, data);
    if (!isValid.success) throw isValid.issues;
    return tsx.update(companies).set(isValid.output).where(eq(companies.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return db.delete(companies).where(eq(companies.id, isValid.output)).returning();
  };
}
