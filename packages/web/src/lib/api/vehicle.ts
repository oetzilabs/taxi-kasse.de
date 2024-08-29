import { cache, redirect } from "@solidjs/router";
import { Vehicles } from "@taxikassede/core/src/entities/vehicles";
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
