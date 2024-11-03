import { query } from "@solidjs/router";
import { Regions } from "@taxikassede/core/src/entities/regions";
import { ensureAuthenticated } from "../auth/context";

export const getAllRegions = query(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const regions = await Regions.all();
  return regions;
}, "regions");
