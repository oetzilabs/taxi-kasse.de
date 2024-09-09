import { desc, eq } from "drizzle-orm";
import {
  InferInput,
  intersect,
  literal,
  nullable,
  number,
  object,
  optional,
  partial,
  pipe,
  safeParse,
  string,
  variant,
} from "valibot";
import { db } from "../drizzle/sql";
import { discounts } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Discounts {
  // Define CreateSchema for discounts
  export const CreateSchema = object({
    name: string(), // Name of the discount
    description: optional(nullable(string())), // Description of the discount
    data: variant("type", [
      object({
        type: literal("percentage"),
        percentageValue: number(),
      }),
      object({
        type: literal("fixed_amount"),
        amountValue: number(),
      }),
      object({
        type: literal("bundle"),
        buyQuantity: number(),
        getQuantity: number(),
        discountOnItemN: number(),
      }),
      object({
        type: literal("volume"),
        volumeThreshold: number(),
        discountValue: number(),
      }),
    ]),
    startDate: optional(nullable(string())), // Start date for the discount
    endDate: optional(nullable(string())), // End date for the discount (optional)
  });

  // Define UpdateSchema for discounts
  export const UpdateSchema = intersect([partial(Discounts.CreateSchema), object({ id: Validator.Cuid2Schema })]);

  // Type for "with" options (if we want to include related data)
  export type WithOptions = NonNullable<Parameters<typeof db.query.discounts.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    companies: true,
    organizations: true,
  };

  // Type for discount info
  export type Info = NonNullable<Awaited<ReturnType<typeof Discounts.findById>>>;

  // Create a new discount
  export const create = async (data: InferInput<typeof Discounts.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Discounts.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(discounts).values(isValid.output).returning();
    const discount = await Discounts.findById(created.id);
    return discount!;
  };

  // Find a discount by its ID
  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return tsx.query.discounts.findFirst({
      where: (fields, ops) => ops.eq(fields.id, id),
      with: {
        ...Discounts._with,
      },
    });
  };

  // Find a discount by its name
  export const findByName = async (name: string, tsx = db) => {
    return tsx.query.discounts.findFirst({
      where: (fields, ops) => ops.eq(fields.name, name),
      with: {
        ...Discounts._with,
      },
    });
  };

  // Update a discount
  export const update = async (data: InferInput<typeof UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Discounts.UpdateSchema, data);
    if (!isValid.success) throw isValid.issues;
    return tsx.update(discounts).set(isValid.output).where(eq(discounts.id, isValid.output.id)).returning();
  };

  // Remove a discount
  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) throw isValid.issues;
    return db.delete(discounts).where(eq(discounts.id, isValid.output)).returning();
  };
}
