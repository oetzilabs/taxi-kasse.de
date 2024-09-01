import { action, cache, redirect } from "@solidjs/router";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { InferInput } from "valibot";
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

export type CreateRide = Omit<InferInput<typeof Rides.CreateSchema.item>, "user_id" | "org_id">;

export const addRide = action(async (data: CreateRide) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  if (!ctx.session)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  if (!ctx.user)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  if (!ctx.session.organization_id)
    throw redirect("/dashboard/organizations/add", {
      statusText: "Please add an organization",
      status: 401,
    });
  const newR = { ...data, user_id: ctx.user.id, org_id: ctx.session.organization_id };
  const ride = await Rides.create([newR]);
  return ride;
});
