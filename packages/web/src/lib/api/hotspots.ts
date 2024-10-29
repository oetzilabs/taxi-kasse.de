import { cache } from "@solidjs/router";
import { Orders } from "@taxikassede/core/src/entities/orders";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Regions } from "@taxikassede/core/src/entities/regions";
import { ensureAuthenticated } from "../auth/context";

export const getHotspots = cache(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  if (!ctx.session.organization_id) return [];

  const currentOrganization = await Organizations.findById(ctx.session.organization_id);
  if (!currentOrganization) return [];

  const regions = await Regions.findByOrganizationId(currentOrganization.id);
  if (regions.length === 0) return [];

  const r_ids: Array<string> = [];

  for (let i = 0; i < regions.length; i++) {
    r_ids.push(regions[i].region_id);
  }

  const hotspots = await Orders.getHotspotsByRegions(r_ids);

  return hotspots;
}, "hotspot");
