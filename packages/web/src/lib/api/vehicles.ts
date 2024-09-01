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

export const addVehicle = action(async (data: InferInput<typeof Vehicles.CreateSchema>) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const vehicle = await Vehicles.create(data);
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
    brandName: string;
    models: {
      value: string;
      label: string;
    }[];
  }> = [];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const vehicleBrand = vehicleBrands.find((brand) => brand.brandName === model.brand);
    if (!vehicleBrand) {
      vehicleBrands.push({
        brandName: model.brand,
        models: [
          {
            value: model.id,
            label: model.name,
          },
        ],
      });
    } else {
      vehicleBrand.models.push({
        value: model.id,
        label: model.name,
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
