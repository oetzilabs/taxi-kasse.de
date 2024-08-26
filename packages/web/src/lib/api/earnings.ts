import { cache } from "@solidjs/router";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { getContext } from "../auth/context";

export const getEarnings = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const earnings = await Rides.findByUserId(ctx.user.id);
  return earnings;
}, "earnings");
