import { cache, redirect } from "@solidjs/router";
import { Regions } from "@taxikassede/core/src/entities/regions";
import { getContext } from "../auth/context";

export const getAllRegions = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const regions = await Regions.all();
  return regions;
}, "regions");
