import L from "leaflet";
import "leaflet-routing-machine";
import { Accessor, JSX, createContext, createEffect, createSignal, useContext } from "solid-js";

export type RouteT = {
  name: string;
  start: string;
  end: string;
  coordinates: {
    start: L.LatLng;
    end: L.LatLng;
    path: [L.LatLng, L.LatLng, ...L.LatLng[]];
  };
  steps: { type?: L.Routing.IInstruction["type"] | "Head"; text?: string }[];
  distance: number;
  duration: number;
  currentStep: number | null;
  nextStep: number | null;
  summary: {
    totalDistance: number;
    totalTime: number;
  };
};

type RouteCtx = [
  Accessor<RouteT | null>,
  {
    cancelRoute: () => void;
    loadRoute: (route: RouteT) => void;
    saveRoute: (route: RouteT) => void;
    routeHistory: Accessor<RouteT[]>;
    lookupAndStoreRoutes: (start: string, end: string) => Promise<void>;
    availableRoutes: Accessor<RouteT[]>;
    selectedAvailableRoute: Accessor<RouteT | null>;
    setSelectedAvailableRouteFromName: (route: string) => void;
  }
];


type LocalStorageRoutes = {
  routes: Array<RouteT>;
  updated: Date | null;
};

const LOCAL_STORAGE_ROUTE_KEY = "localroutes" as const;

const DEFAULT_LOCAL_STORAGE_ROUTE = JSON.stringify({ routes: [], updated: null } as LocalStorageRoutes);

export const RouteContext = createContext<RouteCtx>([
  () => null,
  {
    availableRoutes: () => [],
    cancelRoute: () => { },
    loadRoute: () => { },
    saveRoute: () => { },
    routeHistory: () => [],
    lookupAndStoreRoutes: async (_start: string, _end: string) => Promise.resolve(),
    selectedAvailableRoute: () => null,
    setSelectedAvailableRouteFromName: (_route: string) => { },
  },
] as RouteCtx);

export const RouteProvider = (props: { children: JSX.Element }) => {
  const [route, setRoute] = createSignal<RouteT | null>(null);
  const [routeHistory, setRouteHistory] = createSignal<RouteT[]>([]);
  const [availableRoutes, setAvailableRoutes] = createSignal<RouteT[]>([]);
  const [selectedAvailableRoute, setSelectedAvailableRoute] = createSignal<RouteT | null>(null);

  const setSelectedAvailableRouteFromName = (routeName: string) => {
    const route = availableRoutes().find((route) => route.name === routeName);
    if (route) {
      setSelectedAvailableRoute(route);
    }
  };

  const lookupAndStoreRoutes = async (start: string, end: string) => {
    // first check if route is in localstorage
    const localroutes = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_ROUTE_KEY)
      || DEFAULT_LOCAL_STORAGE_ROUTE
    ) as LocalStorageRoutes;
    const route = localroutes.routes.find((route) => route.start === start && route.end === end);
    if (route) {
      setAvailableRoutes([route]);
      setSelectedAvailableRoute(route);
      return;
    }
    const response1 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURI(start)}&format=json&addressdetails=1`
    );
    const response2 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURI(end)}&format=json&addressdetails=1`
    );
    const latlng1Json = await response1.json();
    const latlng2Json = await response2.json();
    const latlng1 = latlng1Json[0];
    const latlng2 = latlng2Json[0];
    const waypoints = [
      L.Routing.waypoint(L.latLng(latlng1.lat, latlng1.lon)),
      L.Routing.waypoint(L.latLng(latlng2.lat, latlng2.lon)),
    ];
    const osmrv1 = L.Routing.osrmv1({
      // serviceUrl: "http://localhost:5000/route/v1",
      suppressDemoServerWarning: true,
    });
    osmrv1.route(
      waypoints,
      // @ts-ignore - these types are fine.
      function(err: any, routes: L.Routing.IRoute[]) {
        if (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }
        let xRoutes = routes.map(
          (route) =>
          ({
            coordinates: {
              start: route.coordinates?.[0],
              end: route.coordinates?.[route.coordinates.length - 1],
              path: route.coordinates,
            },
            distance: route.summary?.totalDistance,
            duration: route.summary?.totalTime,
            end,
            start,
            name: `${start} to ${end}`,
            steps: route.instructions?.map((step) => ({
              type: step.type,
              text: step.text,
            })),
            summary: {
              totalDistance: route.summary?.totalDistance,
              totalTime: route.summary?.totalTime,
            },
            currentStep: 0,
            nextStep: 1,
          } as RouteT)
        );
        setAvailableRoutes(xRoutes);
      }
    );
  };
  createEffect(() => {
    // load routes from localstorage and set as route history
    const localroutes = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_ROUTE_KEY)
      || DEFAULT_LOCAL_STORAGE_ROUTE
    ) as LocalStorageRoutes;
    setRouteHistory(localroutes.routes);
  });

  const cancelRoute = () => setRoute(null);

  const loadRoute = (route: RouteT) => setRoute(route);

  const saveRoute = (route: RouteT) => {
    const localroutes = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_ROUTE_KEY) ||
      JSON.stringify({
        routes: [],
        updated: null,
      } as LocalStorageRoutes)
    ) as LocalStorageRoutes;
    localroutes.routes.push(route);
    localroutes.updated = new Date();
    localStorage.setItem(LOCAL_STORAGE_ROUTE_KEY, JSON.stringify(localroutes));
  };

  return (
    <RouteContext.Provider
      value={[
        route,
        {
          lookupAndStoreRoutes,
          routeHistory,
          cancelRoute,
          loadRoute,
          saveRoute,
          availableRoutes,
          selectedAvailableRoute,
          setSelectedAvailableRouteFromName,
        },
      ]}
    >
      {props.children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const x = useContext(RouteContext);
  if (!x) {
    throw new Error("RouteContext not found");
  }
  return x;
};
