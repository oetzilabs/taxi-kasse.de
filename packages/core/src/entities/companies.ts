import { desc, eq } from "drizzle-orm";
import {
  InferInput,
  intersect,
  nullable,
  number,
  object,
  omit,
  optional,
  partial,
  pipe,
  safeParse,
  string,
  transform,
} from "valibot";
import { db } from "../drizzle/sql";
import { companies, user_companies } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Companies {
  export const CreateSchema = object({
    ownerId: Validator.Cuid2Schema,
    name: string(),
    email: string(),
    phoneNumber: optional(nullable(string())),
    image: optional(string()),
    banner: optional(string()),
    website: optional(nullable(string())),

    uid: string(),

    base_charge: optional(nullable(Validator.MinZeroSchema)),
    distance_charge: optional(nullable(Validator.MinZeroSchema)),
    time_charge: optional(nullable(Validator.MinZeroSchema)),
  });

  export const CreateWithoutOwnerSchema = omit(CreateSchema, ["ownerId"]);
  export const CreateWithoutOwnerAndCharges = omit(CreateSchema, [
    "ownerId",
    "base_charge",
    "distance_charge",
    "time_charge",
  ]);

  export const UpdateSchema = intersect([
    partial(Companies.CreateSchema),
    object({
      id: Validator.Cuid2Schema,
    }),
  ]);

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
    const bC = String(isValid.output.base_charge ?? 0);
    const dC = String(isValid.output.distance_charge ?? 0);
    const tC = String(isValid.output.time_charge ?? 0);
    const [created] = await tsx
      .insert(companies)
      .values([{ ...isValid.output, base_charge: bC, distance_charge: dC, time_charge: tC }])
      .returning();
    const ucs = await tsx
      .insert(user_companies)
      .values([{ company_id: created.id, user_id: isValid.output.ownerId, role: "owner" }])
      .returning();

    const company = await Companies.findById(created.id);
    return company!;
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
          with: {
            user: {
              with: {
                vehicles: {
                  with: {
                    model: true,
                  },
                },
              },
            },
          },
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
          with: {
            user: {
              with: {
                vehicles: {
                  with: {
                    model: true,
                  },
                },
              },
            },
          },
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
          with: {
            user: {
              with: {
                vehicles: {
                  with: {
                    model: true,
                  },
                },
              },
            },
          },
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
          with: {
            user: {
              with: {
                vehicles: {
                  with: {
                    model: true,
                  },
                },
              },
            },
          },
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
    const bC = String(isValid.output.base_charge ?? undefined);
    const dC = String(isValid.output.distance_charge ?? undefined);
    const tC = String(isValid.output.time_charge ?? undefined);
    return tsx
      .update(companies)
      .set({ ...isValid.output, base_charge: bC, distance_charge: dC, time_charge: tC })
      .where(eq(companies.id, isValid.output.id))
      .returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return db.delete(companies).where(eq(companies.id, isValid.output)).returning();
  };

  export const allNonDeleted = async (tsx = db) => {
    return tsx.query.companies.findMany({
      where: (fields, ops) => ops.isNull(fields.deletedAt),
      with: {
        ...Companies._with,
        regions: {
          with: {
            region: true,
          },
        },
        employees: {
          with: {
            user: {
              with: {
                vehicles: {
                  with: {
                    model: true,
                  },
                },
              },
            },
          },
        },
        discounts: {
          with: {
            discount: true,
          },
        },
      },
    });
  };
}
