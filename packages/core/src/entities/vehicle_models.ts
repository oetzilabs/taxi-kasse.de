import type { InferInput } from "valibot";
import { eq, inArray, notInArray } from "drizzle-orm";
import { array, object, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { vehicle_models } from "../drizzle/sql/schema";

export module VehicleModels {
  export const CreateSchema = array(
    object({
      name: string(),
      brand: string(),
    })
  );

  export type WithOptions = NonNullable<Parameters<typeof db.query.vehicle_models.findFirst>[0]>["with"];
  export const _with: WithOptions = {
    vehicles: true,
  };

  export const findById = async (id: string, tsx = db) => {
    return tsx.query.vehicle_models.findFirst({
      where: (fields, ops) => ops.eq(fields.id, id),
      with: _with,
    });
  };

  export const getModels = async (tsx = db) => {
    return tsx.query.vehicle_models.findMany({});
  };

  export const create = async (data: InferInput<typeof VehicleModels.CreateSchema>, tsx = db) => {
    const isValid = safeParse(VehicleModels.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const created = await tsx.insert(vehicle_models).values(isValid.output).returning();

    const createdVehicleModel: NonNullable<Awaited<ReturnType<typeof VehicleModels.findById>>>[] = [];
    for (let i = 0; i < created.length; i++) {
      const vehicleModel = created[i];
      const v = await VehicleModels.findById(vehicleModel.id)!;
      if (!v) {
        continue;
      }
      createdVehicleModel.push(v);
    }

    return createdVehicleModel;
  };

  export const exists = async (data: InferInput<typeof VehicleModels.CreateSchema>[number], tsx = db) => {
    const isValid = safeParse(VehicleModels.CreateSchema.item, data);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.vehicle_models.findFirst({
      where: (fields, ops) =>
        ops.and(ops.eq(fields.name, isValid.output.name), ops.eq(fields.brand, isValid.output.brand)),
    });
  };

  export const upsert = async (data: InferInput<typeof VehicleModels.CreateSchema>, tsx = db) => {
    const isValid = safeParse(VehicleModels.CreateSchema, data);
    if (!isValid.success) {
      throw isValid.issues;
    }

    const result = [];

    const toCreate = [];
    for (let i = 0; i < isValid.output.length; i++) {
      const vehicleModel = isValid.output[i];
      const existing = await VehicleModels.exists(vehicleModel);
      if (!existing) {
        toCreate.push(vehicleModel);
      } else {
        const [updated] = await tsx
          .update(vehicle_models)
          .set(vehicleModel)
          .where(eq(vehicle_models.id, existing.id))
          .returning();
        if(!updated) {
          continue;
        }
        const found = await VehicleModels.findById(updated.id);
        if(!found) {
          continue;
        }
        result.push(found);
      }
    }
    if (toCreate.length > 0) {
      const created = await VehicleModels.create(toCreate);
      result.concat(created);
    }
    return result;
  };

  export const all = async (tsx = db) => {
    return tsx.query.vehicle_models.findMany({
      with: _with,
    });
  };
}
