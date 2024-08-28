import { cache, redirect } from "@solidjs/router";
import { Orders } from "@taxikassede/core/src/entities/orders";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Regions } from "@taxikassede/core/src/entities/regions";
import { getContext } from "../auth/context";

export const getOrders = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  if (!ctx.session.organization_id) throw redirect("/organization/create");

  const currentOrganization = await Organizations.findById(ctx.session.organization_id);
  if (!currentOrganization) throw redirect("/organization/create");

  const orders = await Orders.findAllByOrganizationId(currentOrganization.id);

  return orders;
}, "orders");

export const getHotspot = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  if (!ctx.session.organization_id) return {};

  const currentOrganization = await Organizations.findById(ctx.session.organization_id);
  if (!currentOrganization) return {};

  const regions = await Regions.findByOrganizationId(currentOrganization.id);

  const hotspot = await Orders.getHotspotByRegions(regions.map((r) => r.region_id));

  return hotspot;
}, "hotspot");
