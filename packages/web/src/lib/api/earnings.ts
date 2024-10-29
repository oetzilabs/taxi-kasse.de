import { cache } from "@solidjs/router";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { ensureAuthenticated } from "../auth/context";

export const getEarnings = cache(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  const earnings = await Rides.findByUserId(ctx.user.id);
  return earnings;
}, "earnings");
