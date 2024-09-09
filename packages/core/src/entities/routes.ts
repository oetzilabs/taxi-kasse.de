import { eq } from "drizzle-orm";
import { InferInput, intersect, nullable, object, omit, partial, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { routes } from "../drizzle/sql/schemas/routes";
import { Validator } from "../validator";

export module Routes {
  export const CreateSchema = object({
    name: string(),
    description: nullable(string()),
    driver_id: Validator.Cuid2Schema,
    ride_id: Validator.Cuid2Schema,
  });

  export const UpdateSchema = intersect([partial(Routes.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.routes.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    waypoints: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Routes.findById>>>;

  export const create = async (data: InferInput<typeof Routes.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Routes.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(routes).values(isValid.output).returning();
    const ride = await Routes.findById(created.id);
    return ride!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.routes.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: {
        ...Routes._with,
        segments: {
          with: {
            points: {
              with: {
                route_segment: {
                  with: {
                    points: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  };

  export const update = async (data: InferInput<typeof Routes.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Routes.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.update(routes).set(isValid.output).where(eq(routes.id, isValid.output.id)).returning();
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(routes).where(eq(routes.id, isValid.output)).returning();
  };
}
