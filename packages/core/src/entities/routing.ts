import type { RouteResults } from "project-osrm__osrm";
import { array, boolean, InferOutput, number, object, optional, picklist, string, tuple } from "valibot";
import { db } from "../drizzle/sql";

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
      lat: number;
      lon: number;
    }>;
    if (json.length === 0) {
      throw new Error("Location not found");
    }
    // return {
    //   lat: json[0].lat,
    //   lng: json[0].lon,
    // };
    return [json[0].lat, json[0].lon];
  };

  // Get distance and duration using OSRM
  export const getDistanceAndDuration = async (from: string, to: string, steps = false) => {
    try {
      const fromCoords = await getCoordinates(from);
      const toCoords = await getCoordinates(to);

      // Fetch route data from OSRM
      const routeResult = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=polyline&steps=${steps}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const routeJson = (await routeResult.json()) as RouteResults;
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

  export const save = async (route: Routing.Info, tsx = db) => {};
}
