import { Tabs, TextField } from "@kobalte/core";
import L from "leaflet";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { cn } from "../utils/cn";
import { Modal } from "./Modal";
import { RouteT, useRoute } from "./Route";
import { RouteStep } from "./RouteStep";
import { toast } from "solid-toast";

const routeTo = (map: L.Map, name: string, coordinates: [L.LatLng, L.LatLng, ...L.LatLng[]]) => {
  if (!map) return;
  map.eachLayer((layer) => {
    if (layer instanceof L.Polyline) {
      const l = layer.getPane("route");
      if (l) l.remove();
    }
  });

  const layerGroup = new L.LayerGroup<L.Polyline>(undefined, {
    pane: "route",
  });

  const routeLine = L.polyline(coordinates, {
    color: "#007AFF",
    weight: 4,
    opacity: 1,
  });

  routeLine.addTo(layerGroup);
  map.addLayer(layerGroup);

  const firstLatLng = coordinates[0];
  const paddedLatLng = [firstLatLng.lat + 0.00001, firstLatLng.lng + 0.00001];
  const ltln = new L.LatLng(paddedLatLng[0], paddedLatLng[1]);
  const latlngbounds = new L.LatLngBounds(ltln, ltln);
  map.fitBounds(latlngbounds, {
    animate: true,
  });
};

const RouteToast = (props: { route: RouteT; status: "deleted" | "started" | "cancelled" }) => {
  return (
    <Transition name="slide-fade">
      <div class="flex flex-row gap-2 items-center justify-center bg-black dark:bg-white w-[300px] rounded-md overflow-clip p-4">
        <span class="text-sm text-white dark:text-black">
          The Route '{props.route.name}' has been {props.status}
        </span>
      </div>
    </Transition>
  );
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
      clearAvailableRoutes,
      routeHistory,
      clearRouteHistory,
    },
  ] = useRoute();
  const [startLocation, setStartLocation] = createSignal<string>("");
  const [endLocation, setEndLocation] = createSignal<string>("");

  // createEffect(() => {
  //   console.log("current route", route());
  //   console.log("route history", routeHistory());
  // });

  const resetModal = (route: RouteT) => {
    setModalOpen(false);
    setStartLocation("");
    setEndLocation("");
    clearAvailableRoutes();
    setTabValue("lookup");
    toast.custom(<RouteToast route={route} status="cancelled" />, {
      duration: 5000,
      ariaProps: {
        role: "status",
        "aria-live": "polite",
      },
    });
  };

  const [routeHistoryPage, setRouteHistoryPage] = createSignal<number>(1);

  const routeHistoryCut = (page: number = 1) => {
    return routeHistory().slice(0, page * 2);
  };

  return (
    <Switch>
      <Match when={route() === null || route()?.steps.length === 0}>
        <div class="flex flex-col gap-2 bg-white dark:bg-black p-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 w-[450px] overflow-clip items-start">
          <Show when={routeHistoryCut().length > 0}>
            <div class="flex flex-col h-auto max-h-[400px] overflow-y-auto w-full">
              <span class="text-lg font-bold p-2">Recent Routes</span>
              <TransitionGroup name="slide-fade">
                <For
                  each={routeHistoryCut(routeHistoryPage())}
                  fallback={
                    <div class="flex flex-col gap-2 w-full">
                      <Switch>
                        <Match when={route() === null}>
                          <div class="flex flex-col w-full gap-2 items-center justify-center rounded-md p-8 bg-neutral-100 dark:bg-neutral-950">
                            <span class="text-lg font-bold">No route found</span>
                          </div>
                        </Match>
                        <Match when={route()?.steps.length === 0}>
                          <div class="flex flex-col gap-2 items-center justify-center rounded-md border border-neutral-100 dark:border-neutral-900 p-8">
                            <span class="text-lg font-bold">The route you selected is empty</span>
                            <span class="text-md font-medium">
                              Try a{" "}
                              <button
                                class="text-blue-500"
                                onClick={() => {
                                  const r = route();
                                  if (!r) return;
                                  resetModal(r);
                                  setModalOpen(true);
                                }}
                              >
                                different route
                              </button>
                            </span>
                          </div>
                        </Match>
                      </Switch>
                    </div>
                  }
                >
                  {(r) => (
                    <Transition name="slide-fade">
                      <div class="w-full p-2 flex flex-row items-center justify-center">
                        <div class="flex flex-col gap-2 items-start justify-start">
                          <div class="flex flex-row gap-2 items-start justify-start">
                            <span class="text-md font-medium">{r.name}</span>
                            <div class="flex flex-row gap-2 items-center justify-center">
                              <button
                                type="button"
                                class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800"
                                onClick={() => {
                                  const m = props.map;
                                  if (!m) return;
                                  loadRoute(r);
                                  routeTo(m, r.name, r.coordinates.path);
                                  toast.custom(<RouteToast route={r} status="started" />, {
                                    duration: 5000,
                                    position: "bottom-right",
                                  });
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
                            </div>
                          </div>
                          <span class="text-xs text-neutral-500">{r.steps.length} Instructions</span>
                        </div>
                      </div>
                    </Transition>
                  )}
                </For>
              </TransitionGroup>
            </div>
          </Show>
          <Show when={routeHistory().length > routeHistoryCut().length}>
            <div class="flex flex-row gap-2 w-full items-center justify-between">
              <button
                class="flex flex-row px-2 py-1 gap-2 items-center justify-center bg-red-100 dark:bg-red-800 rounded-md w-max"
                onClick={() => {
                  clearRouteHistory();
                }}
              >
                <span class="text-sm w-max">Clear History</span>
              </button>
              <button
                disabled={routeHistoryPage() === 1}
                class="flex flex-row px-2 py-1 gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const x = routeHistoryPage();
                  if (x === 1) return;
                  setRouteHistoryPage(x - 1);
                }}
              >
                <span class="text-sm">Less</span>
              </button>
              <button
                disabled={routeHistoryPage() * 2 >= routeHistory().length}
                class="flex flex-row px-2 py-1 gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const x = routeHistoryPage();
                  if (x * 2 >= routeHistory().length) return;
                  setRouteHistoryPage(x + 1);
                }}
              >
                <span class="text-sm">More</span>
              </button>
            </div>
          </Show>
          <Modal
            open={modalOpen()}
            onOpenChange={setModalOpen}
            title="Start a new Route"
            trigger={
              <div class="flex flex-row gap-4 px-4 py-3 items-center w-full hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md p-2 justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span class="text-md font-bold">New Route</span>
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
                        class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-md  border border-neutral-200 dark:border-neutral-800"
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
                      toast.custom(<RouteToast route={theRoute} status="started" />, {
                        duration: 5000,
                        position: "bottom-right",
                      });
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
        </div>
      </Match>
      <Match when={route() && route()}>
        {(r) => (
          <div class="flex flex-col gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 items-center justify-center">
            <Transition name="slide-fade">
              <Show when={r().currentStep !== null}>
                <RouteStep
                  step={r().steps[r().currentStep!]}
                  next={r().nextStep ? r().steps[r().nextStep!] : null}
                  onCancel={(route: RouteT) => {
                    resetModal(route);
                    // reset the map state
                    const m = props.map;
                    if (!m) return;
                    m.eachLayer((layer) => {
                      if (layer instanceof L.Polyline) {
                        layer.remove();
                      }
                    });
                  }}
                />
              </Show>
            </Transition>
          </div>
        )}
      </Match>
    </Switch>
  );
};
