import { cache, redirect } from "@solidjs/router";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { getContext } from "../auth/context";

export const getRides = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const rides = await Rides.findByUserId(ctx.user.id);
  return rides;
}, "rides");

export const getRidesByUserId = cache(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const user = await Users.findById(id);
  if (!user)
    throw redirect("/404", {
      statusText: "User not found",
      status: 404,
    });
  const rides = await Rides.findByUserId(user.id);
  return rides;
}, "rides");
