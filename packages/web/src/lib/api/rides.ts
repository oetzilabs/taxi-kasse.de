import { action, cache, json, redirect } from "@solidjs/router";
import { db } from "@taxikassede/core/src/drizzle/sql";
import { Companies } from "@taxikassede/core/src/entities/companies";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Realtimed } from "@taxikassede/core/src/entities/realtime";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Routing } from "@taxikassede/core/src/entities/routing";
import { Users } from "@taxikassede/core/src/entities/users";
import { Vehicles } from "@taxikassede/core/src/entities/vehicles";
import { InferInput } from "valibot";
import { getContext } from "../auth/context";
import { getStatistics } from "./statistics";

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

export const addRide = action(async (data: CreateRide, lastSavedVehicleId: string | null) => {
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
  if (lastSavedVehicleId) {
    const c = await db.transaction(async (tsx) => {
      let collection: Array<Vehicles.Info> = [];
      try {
        const updatedVehicle = await Vehicles.update(
          {
            id: data.vehicle_id,
            preferred: data.vehicle_id === lastSavedVehicleId,
          },
          // @ts-ignore
          tsx,
        );
        const allVehicles = await Vehicles.findByUserId(
          ctx.user.id,
          // @ts-ignore
          tsx,
        );
        const unPreferredVehicles = allVehicles.filter((v) => v.id !== data.vehicle_id);
        const updatedOtherVehicles = await Vehicles.updateBulk(
          unPreferredVehicles.map((v) => v.id),
          { preferred: false },
          // @ts-ignore
          tsx,
        );
        const c = updatedOtherVehicles.concat(updatedVehicle);
        collection = c;
      } catch (e) {
        console.dir(e, { depth: Infinity });
        tsx.rollback();
      }
      return collection;
    });
    for (const vehicle of c) {
      await Realtimed.sendToMqtt("vehicle.updated", vehicle);
    }
  }

  await Realtimed.sendToMqtt("ride.created", ride);

  return json(ride, {
    revalidate: [getRides.key, getStatistics.key],
  });
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

  await Realtimed.sendToMqtt("ride.deleted", ride);

  return json(removed, {
    revalidate: [getRides.key, getStatistics.key],
  });
});

export const removeRideBulk = action(async (rids: Array<string>) => {
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
  const rides = await Rides.findManyById(rids);
  if (!rides)
    throw redirect("/404", {
      status: 404,
      statusText: "Ride not found",
    });
  const owner_id = rides[0].user.id;
  if (ctx.user.id !== owner_id) throw new Error("You are not the owner of this ride");
  const removed = await Rides.markDeletedBulk(rids);
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

export const getSystemRides = cache(async () => {
  "use server";
  const [ctx, _event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const rides = await Rides.allNonDeleted();
  return rides;
}, "system-rides");

export const removeRidesBulk = action(async (rids: Array<string>) => {
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
  if (!rids.length) throw new Error("No rides selected");

  const ridesExist = await Rides.checkIfRidesAreOwnedByUser(rids);
  if (ridesExist.length !== rids.length) throw new Error("Some rides are not owned by you");

  // TODO: check if rides are owned by user
  const removed = await Rides.markDeletedBulk(ridesExist.map((r) => r.id));

  // send mqtt message
  for (const ride of removed) {
    await Realtimed.sendToMqtt("ride.deleted", ride);
  }

  return json(removed, {
    revalidate: [getRides.key, getStatistics.key],
  });
});

export const calculateDistanceAndCharge = action(async (vehicle: string, departure: string, arrival: string) => {
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

  const v = await Vehicles.findById(vehicle);
  if (!v) throw new Error("Vehicle not found");
  let distance_charge = 0;
  let duration_charge = 0;
  let base_charge = 0;
  let result = 0;
  if (ctx.session.organization_id) {
    const org = await Organizations.findById(ctx.session.organization_id);
    if (org) {
      const dc = Number(org.distance_charge);
      if (!isNaN(dc)) {
        distance_charge = dc;
      }
      const tc = Number(org.time_charge);
      if (!isNaN(tc)) {
        duration_charge = tc;
      }
      const bc = Number(org.base_charge);
      if (!isNaN(bc)) {
        base_charge = bc;
      }
    }
  }
  if (ctx.session.company_id) {
    const comp = await Companies.findById(ctx.session.company_id);
    if (comp) {
      const dc = Number(comp.distance_charge);
      if (!isNaN(dc)) {
        distance_charge = dc;
      }
      const tc = Number(comp.time_charge);
      if (!isNaN(tc)) {
        duration_charge = tc;
      }
      const bc = Number(comp.base_charge);
      if (!isNaN(bc)) {
        base_charge = bc;
      }
    }
  }

  if (!departure || !arrival) throw new Error("Please enter a departure and arrival address");
  const routeResult = await Routing.getDistanceAndDuration(departure, arrival);
  const rd = Math.floor(routeResult.distance * 100) / 100;
  const rdu = Math.floor(routeResult.duration);
  const dcc = rd * distance_charge;
  const dcc2 = rdu * duration_charge;
  result = dcc + dcc2 + base_charge;
  return {
    distance: rd,
    duration: rdu,
    result,
    coords: routeResult.coords,
    routes: routeResult.routes,
  };
});
