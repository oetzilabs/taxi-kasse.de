import { eq, inArray, isNull } from "drizzle-orm";
import {
  array,
  boolean,
  date,
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
import { vehicles } from "../drizzle/sql/schema";
import { Validator } from "../validator";
import { VehicleModels } from "./vehicle_models";

export module Vehicles {
  export const CreateSchema = array(
    object({
      owner_id: Validator.Cuid2Schema,
      name: string(),
      license_plate: string(),
      model_id: nullable(string()),
      inspection_date: nullable(date()),
      mileage: string(),
      preferred: optional(boolean()),
      overwrite_base_charge: optional(
        nullable(
          pipe(
            Validator.MinZeroSchema,
            transform((val) => String(val)),
          ),
        ),
      ),
      overwrite_distance_charge: optional(
        nullable(
          pipe(
            Validator.MinZeroSchema,
            transform((val) => String(val)),
          ),
        ),
      ),
      overwrite_time_charge: optional(
        nullable(
          pipe(
            Validator.MinZeroSchema,
            transform((val) => String(val)),
          ),
        ),
      ),
    }),
  );
  export const UpdateSchema = intersect([partial(CreateSchema.item), object({ id: Validator.Cuid2Schema })]);

  export type WithOptions = NonNullable<Parameters<typeof db.query.vehicles.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    rides: {
      with: {
        company: {
          with: {
            owner: true,
            employees: {
              with: {
                user: true,
              },
            },
          },
        },
        user: {
          with: {
            orgs: {
              with: {
                organization: true,
              },
            },
          },
        },
      },
    },
    owner: true,
    model: true,
  };

  export type Info = NonNullable<Awaited<ReturnType<typeof Vehicles.findById>>>;

  export const create = async (data: InferInput<typeof Vehicles.CreateSchema>, tsx = db) => {
    const isValid = safeParse(Vehicles.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [created] = await tsx.insert(vehicles).values(isValid.output).returning();
    const vehicle = await Vehicles.findById(created.id)!;
    return vehicle!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.vehicles.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: _with,
    });
  };

  export const update = async (data: InferInput<typeof Vehicles.UpdateSchema>, tsx = db) => {
    const isValid = safeParse(Vehicles.UpdateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const [updated] = await tsx
      .update(vehicles)
      .set(isValid.output)
      .where(eq(vehicles.id, isValid.output.id))
      .returning();
    const vehicle = await Vehicles.findById(updated.id, tsx)!;
    return vehicle!;
  };

  export const remove = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.delete(vehicles).where(eq(vehicles.id, isValid.output)).returning();
  };

  export const findByUserId = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.vehicles.findMany({
      where: (fields, ops) => ops.and(ops.eq(fields.owner_id, isValid.output), isNull(fields.deletedAt)),
      with: _with,
      orderBy(fields, operators) {
        return operators.asc(fields.name);
      },
    });
  };

  export const importVehicleBrands = async (tsx = db) => {
    // made by @k1muza from https://github.com/k1muza/car_models (date: 2021-01-22T10:48:03.000Z)
    const url = "https://raw.githubusercontent.com/k1muza/car_models/main/vehicles.json";
    const response = await fetch(url);

    const RemoteVehicleSchema = array(
      object({
        id: string(),
        name: string(),
        models: array(
          object({
            id: string(),
            name: string(),
          }),
        ),
      }),
    );

    const json = await response.json();
    const isValid = safeParse(RemoteVehicleSchema, json);
    if (!isValid.success) {
      throw isValid.issues;
    }

    const models: InferInput<typeof VehicleModels.CreateSchema> = [];
    for (let i = 0; i < isValid.output.length; i++) {
      const remoteBrand = isValid.output[i];
      for (let j = 0; j < remoteBrand.models.length; j++) {
        const remoteModel = remoteBrand.models[j];
        models.push({
          name: remoteModel.name,
          brand: remoteBrand.name,
        });
      }
    }

    const vehicle_models = await VehicleModels.upsert(models, tsx);

    return vehicle_models;
  };

  export const markDeleted = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx
      .update(vehicles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(vehicles.id, isValid.output))
      .returning();
  };

  export const findManyById = async (ids: Array<InferInput<typeof Validator.Cuid2Schema>>, tsx = db) => {
    const isValid = safeParse(array(Validator.Cuid2Schema), ids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const vehiclesFound = await tsx.query.vehicles.findMany({
      where: (fields, ops) => ops.and(ops.inArray(fields.id, isValid.output)),
      with: _with,
      orderBy(fields, operators) {
        return operators.asc(fields.name);
      },
    });

    return vehiclesFound;
  };

  export const UpdateBulkSchema = partial(CreateSchema.item);

  export const updateBulk = async (
    ids: Array<InferInput<typeof Validator.Cuid2Schema>>,
    data: InferInput<typeof Vehicles.UpdateBulkSchema>,
    tsx = db,
  ) => {
    const isValid = safeParse(array(Validator.Cuid2Schema), ids);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const isValidData = safeParse(Vehicles.UpdateBulkSchema, data);
    if (!isValidData.success) {
      throw isValidData.issues;
    }
    const updated = await tsx
      .update(vehicles)
      .set(isValidData.output)
      .where(inArray(vehicles.id, isValid.output))
      .returning();
    const vs = await Vehicles.findManyById(updated.map((v) => v.id));
    return vs;
  };
}
