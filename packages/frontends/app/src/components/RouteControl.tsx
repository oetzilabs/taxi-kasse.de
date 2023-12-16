import { Tabs, TextField } from "@kobalte/core";
import L from "leaflet";
import { Switch, Match, For, Show, createSignal, createEffect } from "solid-js";
import { Transition } from "solid-transition-group";
import routes from "../routes";
import { cn } from "../utils/cn";
import { Modal } from "./Modal";
import { RouteStep } from "./RouteStep";
import { RouteT, useRoute } from "./Route";

const routeTo = (map: L.Map, name: string, coordinates: [L.LatLng, L.LatLng, ...L.LatLng[]]) => {
  if (!map) return;
  const routeLine = L.polyline(coordinates, {
    color: "#007AFF",
    weight: 4,
    opacity: 1,
  });

  routeLine.addTo(map);
  // start at the beginning of the route.
  const firstLatLng = coordinates[0];
  const paddedLatLng = [firstLatLng.lat + 0.00001, firstLatLng.lng + 0.00001];
  const ltln = new L.LatLng(paddedLatLng[0], paddedLatLng[1]);
  const latlngbounds = new L.LatLngBounds(ltln, ltln);
  map.fitBounds(latlngbounds, {
    animate: true,
  });
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
  //   autoRoute: false,
  //   waypoints: coordinates,
  //   containerClassName: "hidden",
  //   router: L.Routing.osrmv1({
  //     // serviceUrl: "http://localhost:5000/route/v1",
  //     suppressDemoServerWarning: true,
  //   }),
  // });
  // routing.addTo(map);
};

export const RouteControl = (props: { map: L.Map | null }) => {
  const [modalOpen, setModalOpen] = createSignal<boolean>(false);
  const [tabValue, setTabValue] = createSignal<"lookup" | "routes">("lookup");
  const [
    route,
    {
      availableRoutes,
      selectedAvailableRoute,
      setSelectedAvailableRouteFromName,
      loadRoute,
      saveRoute,
      lookupAndStoreRoutes,
    },
  ] = useRoute();
  const [startLocation, setStartLocation] = createSignal<string>("");
  const [endLocation, setEndLocation] = createSignal<string>("");

  return (
    <Switch>
      <Match when={route() === null || route()?.steps.length === 0}>
        <Modal
          open={modalOpen()}
          onOpenChange={setModalOpen}
          title="Start a new Route"
          trigger={
            <div class="flex flex-col gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
              <div class="flex flex-row gap-2 items-center justify-center">
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
                <span class="text-md">New Route</span>
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
                <Tabs.Trigger
                  value="routes"
                  class={cn(
                    "ui-selected:border-b ui-selected:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  disabled={availableRoutes().length === 0}
                >
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
                        await lookupAndStoreRoutes(startLocation(), endLocation());
                        setTabValue("routes");
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
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <span class="text-sm">Lookup</span>
                    </button>
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="routes" class="w-full flex flex-col gap-2 py-2">
                <div class="grid grid-cols-2 w-full gap-2">
                  <For
                    each={availableRoutes()}
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
                              route.name === selectedAvailableRoute()?.name,
                          }
                        )}
                        onClick={() => {
                          setSelectedAvailableRouteFromName(route.name);
                        }}
                      >
                        <span class="text-lg font-bold">{route.name}</span>
                        <span class="text-md font-medium">
                          {Math.floor((route.summary?.totalDistance ?? 0) / 1000)}km -{" "}
                          {Math.floor((route.summary?.totalTime ?? 0) / 60)} min.
                        </span>
                        <span>{route.steps?.length} Instructions</span>
                      </div>
                    )}
                  </For>
                </div>
                <button
                  type="button"
                  class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800"
                  onClick={() => {
                    const theRoute = selectedAvailableRoute();
                    if (!theRoute) {
                      return;
                    }
                    if (!theRoute.coordinates) return;
                    loadRoute(theRoute);
                    const m = props.map;
                    if (!m) return;
                    routeTo(m, theRoute.name ?? "", theRoute.coordinates.path);
                    saveRoute(theRoute);
                    setModalOpen(false);
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
      <Match when={route() !== null && route()!.steps.length > 0 && route()}>
        {(r) => (
          <div class="flex flex-col gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 items-center justify-center">
            <Transition name="slide-fade">
              <Show when={r().currentStep && r().currentStep}>
                {(cs) => <RouteStep step={r().steps[cs()]} next={r().nextStep ? r().steps[r().nextStep!] : null} />}
              </Show>
            </Transition>
          </div>
        )}
      </Match>
    </Switch>
  );
};
