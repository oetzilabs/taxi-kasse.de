import type { RouteResults } from "project-osrm__osrm";
import { array, boolean, InferOutput, number, object, optional, picklist, string, tuple } from "valibot";
import { db } from "../drizzle/sql";
import { route_segments, routes, routes_waypoints, segment_points } from "../drizzle/sql/schema";

export module Routing {
  // Get coordinates for the location using Nominatim
  const getCoordinates = async (location: string): Promise<[number, number]> => {
    const result = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}&limit=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = (await result.json()) as Array<{
      lat: string;
      lon: string;
    }>;
    if (json.length === 0) {
      throw new Error("Location not found");
    }
    // return {
    //   lat: json[0].lat,
    //   lng: json[0].lon,
    // };
    return [Number(json[0].lat), Number(json[0].lon)];
  };

  // Get distance and duration using OSRM
  export const getDistanceAndDuration = async (from: string, to: string, steps = false) => {
    try {
      const fromCoords = await getCoordinates(from);
      const toCoords = await getCoordinates(to);
      let routeJson: RouteResults | undefined;
      const routeResult = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=polyline&steps=${steps}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      routeJson = (await routeResult.json().catch(() => undefined)) as RouteResults | undefined;
      if (!routeJson) throw new Error("Route not found");

      if (routeJson.routes && routeJson.routes.length > 0) {
        const { distance, duration } = routeJson.routes[0];
        return {
          distance: distance / 1000, // Distance in kilometers
          duration: duration / 60, // Duration in minutes
          coords: { from: fromCoords, to: toCoords },
          routes: routeJson.routes[0],
        };
      }

      throw new Error("Route not found");
    } catch (error) {
      console.error("Error fetching distance and duration:", error);
      return { distance: 0, duration: 0, coords: { from: undefined, to: undefined }, routes: undefined };
    }
  };

  export type Info = Awaited<ReturnType<typeof Routing.getDistanceAndDuration>>;

  export const save = async (route: Routing.Info, tsx = db) => {
    if (!route.routes) return;

    const { coords, routes: routeData } = route;
    const routeDuration = route.duration;
    const routeDistance = route.distance;
    const fromCoords = coords.from;
    const toCoords = coords.to;

    // Create the main route entry
    const [{ id: routeId }] = await tsx
      .insert(routes)
      .values({
        name: `Route from ${fromCoords} to ${toCoords}`,
        geometry: routeData.geometry,
        description: `Distance: ${routeDistance} km, Duration: ${routeDuration} min`,
        driver_id: "some_driver_id", // Replace with dynamic value
        ride_id: "some_ride_id", // Replace with dynamic value
      })
      .returning();

    if (!routeId) throw new Error("Failed to insert route");

    // // Add waypoints (intermediate points) to routes_waypoints
    // if (routeData.waypoints) {
    //   for (const waypoint of routeData.waypoints) {
    //     await tsx.insert(routes_waypoints).values({
    //       route_id: routeId,
    //       latitude: waypoint.location[1],
    //       longitude: waypoint.location[0],
    //     });
    //   }
    // }

    // Insert segments and segment points
    // if (routeData.legs) {
    //   for (let legIndex = 0; legIndex < routeData.legs.length; legIndex++) {
    //     const leg = routeData.legs[legIndex];

    //     for (let stepIndex = 0; stepIndex < leg.steps.length; stepIndex++) {
    //       const step = leg.steps[stepIndex];
    //       const [{ id: segmentId }] = await tsx
    //         .insert(route_segments)
    //         .values({
    //           route_id: routeId,
    //           sequence: stepIndex,
    //           direction: step.maneuver.bearing_after,
    //           distance: step.distance,
    //         })
    //         .returning();

    //       if (!segmentId) throw new Error("Failed to insert segment");

    //       // Save segment points based on the polyline geometry or intersection points
    //       for (const intersection of step.intersections) {
    //         await tsx.insert(segment_points).values({
    //           route_segment_id: segmentId,
    //           latitude: intersection.location[1],
    //           longitude: intersection.location[0],
    //           direction: intersection.bearings ? intersection.bearings[0] : 0, // Example handling of missing data
    //           point_type: step.maneuver.type, // Custom mapping function
    //         });
    //       }
    //     }
    //   }
    // }
  };
}
