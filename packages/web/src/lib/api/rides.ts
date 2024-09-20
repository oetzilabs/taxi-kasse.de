import { action, cache, redirect } from "@solidjs/router";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { InferInput } from "valibot";
import { getContext } from "../auth/context";

export const getRides = cache(async () => {
  "use server";
  const [ctx, _event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const rides = await Rides.findByUserId(ctx.user.id);
  return rides;
}, "rides");

export const getRidesByUserId = cache(async (id: string) => {
  "use server";
  const [ctx, _event] = await getContext();
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

export const addRide = action(async (data: CreateRide, _lastSavedVehicleId: string | null) => {
  "use server";
  const [ctx, _event] = await getContext();
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
  // TODO: set lastSavedVehicleId somewhere...
  return ride;
});

export const getRide = cache(async (rid: string) => {
  "use server";
  if (!rid) return undefined;
  const [ctx, _event] = await getContext();
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
  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });
  return ride;
}, "ride");

export const removeRide = action(async (rid: string) => {
  "use server";
  const [ctx, _event] = await getContext();
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
  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });
  const owner_id = ride.user.id;
  if (ctx.user.id !== owner_id) throw new Error("You are not the owner of this ride");

  const removed = await Rides.markDeleted(rid);
  return removed;
});

export const setRoutes = action(async (rid: string, routeWaypoints: Array<[number, number]>) => {
  "use server";
  const [ctx, _event] = await getContext();
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

  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });

  const updatedRoutes = await Rides.updateRoutes({
    id: ride.id,
    waypoints: routeWaypoints,
  });

  return updatedRoutes;
});

export const setCharge = action(async (rid: string, charge: number) => {
  "use server";
  const [ctx, _event] = await getContext();
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

  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });

  const updated = await Rides.update({
    id: ride.id,
    income: charge.toString(),
  });

  return updated;
});

export const setRating = action(async (rid: string, rating: number) => {
  "use server";
  const [ctx, _event] = await getContext();
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
  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });
  const updated = await Rides.update({
    id: ride.id,
    rating: rating.toString(),
  });

  return updated;
});

export const setStatus = action(async (rid: string, status: InferInput<typeof Rides.StatusSchema>) => {
  "use server";
  const [ctx, _event] = await getContext();
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

  const ride = await Rides.findById(rid);
  if (!ride)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });

  const updated = await Rides.update({
    id: ride.id,
    status,
  });

  return updated;
});
