import L, { LatLng, LatLngTuple } from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { For, Match, Show, Switch, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { ThemeColors, useTheme } from "./theme";
import { Modal } from "./Modal";
import { Tabs, TextField } from "@kobalte/core";
import { text } from "../../../../functions/src/utils";
import { createMutation } from "@tanstack/solid-query";
import { cn } from "../utils/cn";

type Geo =
  | {
      type: "idle";
    }
  | {
      type: "loading";
    }
  | {
      type: "success";
      coordinates: LatLngTuple;
      accuracy?: number;
      zoom: number;
    }
  | {
      type: "error";
      message: string;
    };

const [mapStore, setMapStore] = createStore<Geo>({
  type: "idle",
});

const [map, setMap] = createSignal<L.Map | null>(null);

const [darkTile] = createSignal<L.TileLayer>(
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
    attribution: `Uses OpenStreetMap data © CartoDB | Tiles © CARTO & OSM Routing via <a href="https://www.openstreetmap.org/fixthemap">OSRM</a>`,
  })
);

const [lightTile] = createSignal<L.TileLayer>(
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
    attribution: `Uses OpenStreetMap data © CartoDB | Tiles © CARTO & OSM Routing via <a href="https://www.openstreetmap.org/fixthemap">OSRM</a>`,
  })
);

const [routes, setRoutes] = createSignal<L.Routing.IRoute[]>([]);
const [routeError, setRouteError] = createSignal<Error | null>(null);

const findRoute = (coordinates: [LatLng, LatLng, ...LatLng[]]) => {
  const m = map();
  if (!m) return;
  const osmrv1 = L.Routing.osrmv1({
    // serviceUrl: "http://localhost:5000/route/v1",
    suppressDemoServerWarning: true,
  });
  osmrv1.route(
    coordinates.map((x) => L.Routing.waypoint(x)),
    // @ts-ignore
    function (err: any, routes: L.Routing.IRoute[]) {
      if (err) {
        console.log(err);
        if (err instanceof Error) {
          setRouteError(err);
        }
        return;
      }
      setRoutes(routes);
    }
  );
};

const routeTo = (name: string, coordinates: [LatLng, LatLng, ...LatLng[]]) => {
  const m = map();
  if (!m) return;
  const localStoreRoutes = JSON.parse(
    localStorage.getItem("localroutes") ??
      JSON.stringify({
        routes: [],
        updated: null,
      })
  ) as {
    routes: L.Routing.IRoute[];
    updated: Date | null;
  };
  if (localStoreRoutes.updated && localStoreRoutes.routes.length > 0) {
    const route = localStoreRoutes.routes.find((x) => {
      if (!x.name) return false;
      return x.name === name;
    });
    if (route && route.coordinates) {
      // load the route from local storage
      console.log("loading route from local storage", route);
      // const routing = L.Routing.control({
      //   lineOptions: {
      //     styles: [
      //       {
      //         className: "stroke-[#007AFF] dark:stroke-[#00DAFF]",
      //       },
      //     ],
      //     extendToWaypoints: false,
      //     missingRouteTolerance: 200,
      //   },
      //   useZoomParameter: false,
      //   addWaypoints: false,
      //   fitSelectedRoutes: true,
      //   autoRoute: true,
      //   waypoints: coordinates,
      //   containerClassName: "hidden",
      //   router: {
      //     route: (waypoints: L.Routing.Waypoint[], callback: (err: any, routes: L.Routing.IRoute[]) => void) => {
      //       callback(null, [route]);
      //     },
      //   },
      // });
      // routing.addTo(m);
      return;
    }
  }

  const routing = L.Routing.control({
    lineOptions: {
      styles: [
        {
          className: "stroke-[#007AFF] dark:stroke-[#00DAFF]",
        },
      ],
      extendToWaypoints: false,
      missingRouteTolerance: 200,
    },
    useZoomParameter: false,
    addWaypoints: false,
    fitSelectedRoutes: true,
    autoRoute: false,

    waypoints: coordinates,
    containerClassName: "hidden",
    router: L.Routing.osrmv1({
      // serviceUrl: "http://localhost:5000/route/v1",
      suppressDemoServerWarning: true,
    }),
  });
  routing.addTo(m);
};

const findLatLngForAddress = async (address: string) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=json&addressdetails=1`);
  const json = await response.json();
  const { lat, lon } = json[0];
  return [lat, lon];
};

function loadMap(
  div: HTMLDivElement,
  {
    coordinates,
    zoom,
    accuracy,
  }: {
    coordinates: LatLngTuple;
    zoom: number;
    accuracy?: number;
  },
  themeMode: ThemeColors
) {
  if (!div) return;
  let m = map();
  if (!m) {
    m = L.map(div).setView(coordinates, zoom);
    m.on("zoom", (e) => {
      if (!m) return;
      const zoom = m.getZoom();
      setMapStore({
        ...mapStore,
        type: "success",
        zoom,
      });
    });
    m.on("move", (e) => {
      if (!m) return;
      const center = m.getCenter();
      setMapStore({
        ...mapStore,
        type: "success",
        coordinates: [center.lat, center.lng],
      });
    });
    const marker = L.marker(coordinates, {
      icon: L.divIcon({
        html: `<div class="relative flex flex-col items-center justify-center bg-blue-500 dark:bg-blue-800 rounded-full text-white -translate-x-[50%] -translate-y-[50%] w-[42px] h-[42px] border border-blue-600 dark:border-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 2h4"/><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>
        </div>`,
      }),
    });
    const circle = L.circle(coordinates, { radius: accuracy ? (accuracy < 10 ? 25 : accuracy) : 25 });
    const featureGroup = L.featureGroup([marker, circle]).addTo(m);
    m.fitBounds(featureGroup.getBounds());
  }

  setMap(m);

  document.title = `Map: ${coordinates[0]}, ${coordinates[1]}${accuracy ? ` - ${accuracy}m` : ""}`;
  // L.marker([51.5, -0.09]).addTo(map).bindPopup("A pretty CSS3 popup.<br> Easily customizable.").openPopup();
}

export const MapComponent = () => {
  let mapDiv: any;

  const [theme, setTheme] = useTheme();
  const startMap = () => {
    const t = theme();
    // const jsonMap = JSON.parse(localStorage.getItem("map") ?? "{}");
    // if (jsonMap.type === "success") {
    //   console.log("loading map from local storage", jsonMap);
    //   loadMap(mapDiv, jsonMap, t);
    //   setMapStore(jsonMap);
    //   return;
    // }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapStore({
          ...mapStore,
          type: "success",
          coordinates: [latitude, longitude],
          zoom: 13,
          accuracy: position.coords.accuracy ?? 25,
        });
        loadMap(
          mapDiv,
          {
            coordinates: [latitude, longitude],
            zoom: 13,
            accuracy: position.coords.accuracy ?? 25,
          },
          t
        );
      },
      (error) => {
        setMapStore({
          type: "error",
          message: error.message,
        });
        console.log(error);
      }
    );
  };

  createEffect(() => {
    const m = map();
    if (!m) return;
    const themeMode = theme();
    if (themeMode === "dark") {
      darkTile().addTo(m);
      lightTile().removeFrom(m);
    } else {
      lightTile().addTo(m);
      darkTile().removeFrom(m);
    }
  });

  onMount(() => {
    startMap();
    onCleanup(() => {
      const m = map();
      if (!m) return;
      m.remove();
      setMap(null);
    });
  });

  createEffect(() => {
    // store the map in local storage
    localStorage.setItem("map", JSON.stringify(mapStore));
  });

  const [currentStep, setCurrentStep] = createSignal<L.Routing.IInstruction | null>(null);
  const [steps, setSteps] = createSignal<L.Routing.IInstruction[]>([]);
  const [startLocation, setStartLocation] = createSignal<string>("");
  const [endLocation, setEndLocation] = createSignal<string>("");
  const [modalOpen, setModalOpen] = createSignal<boolean>(false);
  const [currentRoute, setCurrentRoute] = createSignal<L.Routing.IRoute | null>(null);
  const [selectedRoute, setSelectedRoute] = createSignal<L.Routing.IRoute["name"] | null>();
  const [tabValue, setTabValue] = createSignal<"lookup" | "routes">("lookup");

  return (
    <div class="w-full h-full relative flex flex-col">
      <div class="absolute z-40 top-2 right-2 flex flex-row gap-2 bg-white dark:bg-black px-2 py-1 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
        <button
          class="flex flex-row gap-2 items-center justify-center bg-white dark:bg-black "
          onClick={() => {
            setTheme(theme() === "dark" ? "light" : "dark");
          }}
        >
          <Switch
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            }
          >
            <Match when={theme() === "dark"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </Match>
          </Switch>
          <span class="text-xs">{theme() === "dark" ? "Dark" : "Light"}</span>
        </button>
        <button
          class="flex flex-row gap-2 items-center justify-center bg-white dark:bg-black "
          onClick={() => {
            const m = map();
            if (!m) return;
            m.locate({ setView: true, enableHighAccuracy: true, maxZoom: 13 });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span class="text-xs">Reset</span>
        </button>
      </div>
      <div class="absolute z-[40] bottom-2 left-[50%] -translate-x-[50%] ">
        <Switch>
          <Match when={steps().length === 0}>
            <Modal
              open={modalOpen()}
              onOpenChange={setModalOpen}
              title="Start a new Route"
              trigger={
                <div class="flex flex-col gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
                  <div class="flex flex-row gap-2 items-center justify-center">
                    <span class="text-md">New Route</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                  </div>
                </div>
              }
            >
              <form onSubmit={async (e) => {}} class="flex flex-col gap-4 h-min w-full">
                <Tabs.Root
                  class="flex flex-col gap-2"
                  value={tabValue()}
                  onChange={(v) => {
                    setTabValue(v as "lookup" | "routes");
                  }}
                >
                  <Tabs.List class="flex flex-row gap-2">
                    <Tabs.Trigger value="lookup" class={cn("ui-selected:border-b ui-selected:border-teal-500")}>
                      Lookup
                    </Tabs.Trigger>
                    <Tabs.Trigger value="routes" class={cn("ui-selected:border-b ui-selected:border-teal-500")}>
                      Routes
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="lookup" class="w-full flex flex-col gap-2 py-2">
                    <TextField.Root class="flex flex-col gap-2">
                      <TextField.Label>Start</TextField.Label>
                      <TextField.Input
                        class="w-full bg-transparent border border-neutral-300 dark:border-neutral-800 px-3 py-2 rounded-md"
                        placeholder="Start"
                        onInput={(e) => {
                          setStartLocation(e.currentTarget.value);
                        }}
                        value={startLocation()}
                      />
                    </TextField.Root>
                    <TextField.Root class="flex flex-col gap-2">
                      <TextField.Label>End</TextField.Label>
                      <TextField.Input
                        class="w-full bg-transparent border border-neutral-300 dark:border-neutral-800 px-3 py-2 rounded-md"
                        placeholder="End"
                        onInput={(e) => {
                          setEndLocation(e.currentTarget.value);
                        }}
                        value={endLocation()}
                      />
                    </TextField.Root>
                    <div class="flex flex-row gap-2 items-center justify-between">
                      <div></div>
                      <div>
                        <button
                          type="button"
                          class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800"
                          onClick={async (e) => {
                            e.preventDefault();
                            const localStoreRoutes = JSON.parse(
                              localStorage.getItem("localroutes") ??
                                JSON.stringify({
                                  routes: [],
                                  updated: null,
                                })
                            ) as {
                              routes: L.Routing.IRoute[];
                              updated: Date | null;
                            };
                            if (localStoreRoutes.updated && localStoreRoutes.routes.length > 0) {
                              const route = localStoreRoutes.routes.find((x) => {
                                if (!x.name) return false;
                                return x.name === `${startLocation()} - ${endLocation()}`;
                              });
                              if (route && route.coordinates) {
                                // load the route from local storage
                                console.log("loading route from local storage", route);

                                return;
                              }
                            }
                            const _startLocation = await findLatLngForAddress(startLocation());
                            const _endLocation = await findLatLngForAddress(endLocation());
                            findRoute([
                              L.latLng(_startLocation[0], _startLocation[1]),
                              L.latLng(_endLocation[0], _endLocation[1]),
                            ]);
                            setTabValue("routes");
                          }}
                        >
                          <span>Lookup</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Tabs.Content>
                  <Tabs.Content value="routes" class="w-full flex flex-col gap-2 py-2">
                    <For
                      each={routes()}
                      fallback={
                        <div class="flex flex-col gap-2 items-center justify-center rounded-md border border-neutral-100 dark:border-neutral-900 p-8">
                          <span class="text-lg font-bold">No routes found</span>
                          <span class="text-md font-medium">Try a different route</span>
                        </div>
                      }
                    >
                      {(route) => (
                        <div
                          class={cn(
                            "flex flex-col gap-2 items-start justify-start p-2 border border-neutral-300 dark:border-neutral-800 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900",
                            {
                              "bg-neutral-100 dark:bg-neutral-900 border-emerald-500 dark:border-emerald-600":
                                route.name === selectedRoute(),
                            }
                          )}
                          onClick={() => {
                            setSelectedRoute(route.name);
                          }}
                        >
                          <span class="text-lg font-bold">{route.name}</span>
                          <span class="text-md font-medium">
                            {Math.floor((route.summary?.totalDistance ?? 0) / 1000)}km -{" "}
                            {Math.floor((route.summary?.totalTime ?? 0) / 60)} min.
                          </span>
                          <span>{route.instructions?.length} Instructions</span>
                        </div>
                      )}
                    </For>
                    <button
                      type="button"
                      class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800"
                      onClick={() => {
                        const theRoute = routes().find((x) => x.name === selectedRoute());
                        if (!theRoute) return;
                        if (!theRoute.coordinates) return;
                        setCurrentRoute(theRoute);
                        setSteps(theRoute.instructions ?? []);
                        routeTo(theRoute.name ?? "", [
                          theRoute.coordinates[0],
                          theRoute.coordinates[theRoute.coordinates.length - 1],
                        ]);
                        setModalOpen(false);
                        // save the route to local storage
                        const localStoreRoutes = JSON.parse(
                          localStorage.getItem("localroutes") ??
                            JSON.stringify({
                              routes: [],
                              updated: null,
                            })
                        ) as {
                          routes: L.Routing.IRoute[];
                          updated: Date | null;
                        };
                        localStoreRoutes.routes.push(theRoute);
                        localStoreRoutes.updated = new Date();
                        localStorage.setItem("localroutes", JSON.stringify(localStoreRoutes));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      <span class="text-sm">Route</span>
                    </button>
                  </Tabs.Content>
                </Tabs.Root>
              </form>
            </Modal>
          </Match>
          <Match when={currentRoute() !== null && steps().length > 0 && steps()}>
            {(s) => (
              <div class="flex flex-col gap-2 w-max items-center justify-center">
                <For each={s()}>
                  {(step) => (
                    <div class="flex flex-row gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 items-center justify-center">
                      <div>{step.type}</div>
                      <Switch>
                        <Match when={step.type === "Left"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="9 14 4 9 9 4" />
                            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                          </svg>
                        </Match>
                        <Match when={step.type === "Right"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="15 14 20 9 15 4" />
                            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                          </svg>
                        </Match>
                        <Match when={step.type === "StartAt"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m5 9 7-7 7 7" />
                            <path d="M12 16V2" />
                            <circle cx="12" cy="21" r="1" />
                          </svg>
                        </Match>
                        <Match when={step.type === "WaypointReached"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0" />
                            <circle cx="12" cy="8" r="2" />
                            <path d="M8.835 14H5a1 1 0 0 0-.9.7l-2 6c-.1.1-.1.2-.1.3 0 .6.4 1 1 1h18c.6 0 1-.4 1-1 0-.1 0-.2-.1-.3l-2-6a1 1 0 0 0-.9-.7h-3.835" />
                          </svg>
                        </Match>
                        <Match when={step.type === "DestinationReached"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M12 2v14" />
                            <path d="m19 9-7 7-7-7" />
                            <circle cx="12" cy="21" r="1" />
                          </svg>
                        </Match>
                      </Switch>
                      <span>{step.text}</span>
                    </div>
                  )}
                </For>
              </div>
            )}
          </Match>
        </Switch>
      </div>
      <Switch>
        <Match when={mapStore.type === "loading"}>
          <div class="items-center justify-center flex flex-col w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span class="text-neutral-500 text-sm">Loading map...</span>
          </div>
        </Match>
        <Match when={mapStore.type === "idle"}>
          <div class="items-center justify-center flex flex-col w-full h-full">
            <button
              class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 "
              onClick={() => {
                startMap();
              }}
            >
              Load map
            </button>
          </div>
        </Match>
        <Match when={mapStore.type === "error" && mapStore}>
          {(x) => <div class="items-center justify-center flex flex-col w-full h-full">{x().message}</div>}
        </Match>
      </Switch>
      <div
        ref={mapDiv}
        id="main-map"
        style={{
          position: "relative",
          "z-index": 10,
          ...(mapStore.type === "success" && {
            width: "100%",
            height: "100%",
          }),
        }}
      />
    </div>
  );
};
