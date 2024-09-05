import { action, cache, redirect } from "@solidjs/router";
import { VehicleModels } from "@taxikassede/core/src/entities/vehicle_models";
import { Vehicles } from "@taxikassede/core/src/entities/vehicles";
import { InferInput } from "valibot";
import { getContext } from "../auth/context";

export const getVehicleIds = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const vehicles = await Vehicles.findByUserId(ctx.user.id);
  const ids = [];
  for (let i = 0; i < vehicles.length; i++) {
    ids.push({
      value: vehicles[i].id,
      label: vehicles[i].name,
    });
  }

  return ids;
}, "vehicle-ids");

export const getVehicles = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const vehicles = await Vehicles.findByUserId(ctx.user.id);
  return vehicles;
}, "vehicles");

export type CreateVehicle = Omit<InferInput<typeof Vehicles.CreateSchema.item>, "owner_id">;

export const addVehicle = action(async (data: CreateVehicle) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const newV = { ...data, owner_id: ctx.user.id };
  const vehicle = await Vehicles.create([newV]);
  return vehicle;
});

export const getVehicleModels = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const models = await VehicleModels.all();
  const vehicleBrands: Array<{
    group: string;
    models: {
      value: string;
      label: string;
    }[];
  }> = [];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const vehicleBrand = vehicleBrands.find((brand) => brand.group === model.brand);
    if (!vehicleBrand) {
      vehicleBrands.push({
        group: model.brand,
        models: [
          {
            value: model.id,
            label: `${model.name} (${model.brand})`,
          },
        ],
      });
    } else {
      vehicleBrand.models.push({
        value: model.id,
        label: `${model.name} (${model.brand})`,
      });
    }
  }
  return vehicleBrands;
}, "vehicle-models");

export const importVehicles = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const vehicles = await Vehicles.importVehicleBrands();
  return vehicles;
});

export const getVehicleById = cache(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const vehicle = await Vehicles.findById(id);
  return vehicle;
}, "vehicle-by-id");

export const updateVehicle = action(async (data: InferInput<typeof Vehicles.UpdateSchema>) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const vehicle = await Vehicles.update(data);
  return vehicle;
});

export const deleteVehicle = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const v = await Vehicles.findById(id);
  if (!v) throw new Error("Vehicle not found");

  const vehicle = await Vehicles.remove(id);
  return vehicle;
});
