import type { RouteResults } from "project-osrm__osrm";
import {
  array,
  boolean,
  InferInput,
  InferOutput,
  number,
  object,
  optional,
  picklist,
  safeParse,
  string,
  tuple,
} from "valibot";
import { db } from "../drizzle/sql";
import { route_segments, routes, routes_waypoints, segment_point_type, segment_points } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Routing {
  export type Info = Awaited<ReturnType<typeof Routing.getDistanceAndDuration>>;

  export type WithOptions = NonNullable<NonNullable<Parameters<typeof db.query.routes.findFirst>[0]>["with"]>;

  export const _with: WithOptions = {
    segments: {
      with: {
        points: true,
      },
      orderBy: (fields, ops) => ops.asc(fields.sequence),
    },
    waypoints: {
      orderBy: (fields, ops) => ops.desc(fields.createdAt),
    },
  };

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
  export const getDistanceAndDuration = async (from: string, to: string, steps = true) => {
    try {
      const fromCoords = await getCoordinates(from);
      const toCoords = await getCoordinates(to);
      let routeJson: RouteResults | undefined;
      const generatedUrl = `http://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=polyline&steps=${steps ? "true" : "false"}`;
      console.log("Generated URL for OSRM", generatedUrl);
      const routeResult = await fetch(generatedUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      routeJson = (await routeResult.json().catch(() => undefined)) as RouteResults | undefined;
      if (!routeJson) throw new Error("Route not found");

      if (routeJson.routes && routeJson.routes.length > 0) {
        const { distance, duration } = routeJson.routes[0];
        return {
          distance: distance / 1000, // Distance in kilometers
          duration: duration / 60, // Duration in minutes
          coords: { from: fromCoords, to: toCoords },
          route: routeJson.routes[0],
        };
      }

      throw new Error("Route not found");
    } catch (error) {
      console.error("Error fetching distance and duration:", error);
      return {
        distance: 0,
        duration: 0,
        coords: { from: [0, 0] as [number, number], to: [0, 0] as [number, number] },
        route: undefined,
      };
    }
  };

  export const ptList = picklist(segment_point_type.enumValues);

  export const save = async (ride_id: string, driver_id: string, data: Routing.Info, tsx = db) => {
    if (!data.route) return;
    const routeDuration = data.duration;
    const routeDistance = data.distance;
    const fromCoords = data.coords.from;
    const toCoords = data.coords.to;

    // Create the main route entry
    const [routed] = await tsx
      .insert(routes)
      .values({
        name: `Route from ${fromCoords} to ${toCoords}`,
        geometry: data.route.geometry,
        description: `Distance: ${routeDistance} km, Duration: ${routeDuration} min`,
        driver_id,
        ride_id,
      })
      .returning();

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
    if (data.route.legs) {
      for (let legIndex = 0; legIndex < data.route.legs.length; legIndex++) {
        const leg = data.route.legs[legIndex];

        for (let stepIndex = 0; stepIndex < leg.steps.length; stepIndex++) {
          const step = leg.steps[stepIndex];
          const [segment] = await tsx
            .insert(route_segments)
            .values([
              {
                distance: String(step.distance),
                route_id: routed.id,
                sequence: stepIndex,
                direction: String(step.maneuver.bearing_after),
              },
            ])
            .returning();

          // Save segment points based on the polyline geometry or intersection points
          let previous_segment_point_id: string | undefined = undefined;
          for (const intersection of step.intersections) {
            let pt = "unknown" as (typeof segment_point_type.enumValues)[number];
            const isPT = safeParse(Routing.ptList, step.maneuver.type);
            if (!isPT.success) {
              pt = "unknown";
            } else {
              pt = isPT.output;
            }
            const upt = pt === "unknown" ? step.maneuver.type : undefined;
            // @ts-ignore this is not a type error, its not `any`
            const segments_pointed = await tsx
              .insert(segment_points)
              .values([
                {
                  route_segment_id: segment.id,
                  latitude: String(intersection.location[1]),
                  longitude: String(intersection.location[0]),
                  direction: intersection.bearings ? intersection.bearings[0] : 0,
                  point_type: pt,
                  unknown_point_type: upt,
                  previous_segment_point_id,
                },
              ])
              .returning();
            if (!segments_pointed.length) throw new Error("Segment point could not be inserted");
            previous_segment_point_id = segments_pointed[0].id as string;
          }
        }
      }
    } else {
      throw new Error("Route steps not found");
    }
    const r = await findById(routed.id, tsx);
    return r!;
  };

  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, tsx = db) => {
    const isValid = safeParse(Validator.Cuid2Schema, id);
    if (!isValid.success) {
      throw isValid.issues;
    }
    return tsx.query.routes.findFirst({
      where: (fields, ops) => ops.eq(fields.id, isValid.output),
      with: {
        segments: {
          with: {
            points: true,
          },
          orderBy: (fields, ops) => ops.asc(fields.sequence),
        },
        waypoints: {
          orderBy: (fields, ops) => ops.desc(fields.createdAt),
        },
      },
    });
  };
}
