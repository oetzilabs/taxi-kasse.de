import L, { LatLng, LatLngTuple } from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { For, Match, Show, Switch, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { ThemeColors, useTheme } from "./theme";
import { Modal } from "./Modal";
import { TextField } from "@kobalte/core";
import { text } from "../../../../functions/src/utils";
import { createMutation } from "@tanstack/solid-query";

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

const routeTo = (coordinates: [LatLng, LatLng, ...LatLng[]]) => {
  const m = map();
  if (!m) return;
  const steps: L.Routing.IInstruction[] = [];
  const osmrv1 = L.Routing.osrmv1({
    // serviceUrl: "http://localhost:5000/route/v1",
    suppressDemoServerWarning: true,
  });
  osmrv1.route(
    coordinates.map((x) => L.Routing.waypoint(x)),
    // @ts-ignore
    function (
      err: any,
      routes: {
        name: string;
        summary: {
          totalDistance: number;
          totalTime: number;
        };
        coordinates: LatLng[];
        instructions: L.Routing.IInstruction[];
        waypoints: L.Routing.Waypoint[];
      }[]
    ) {
      if (err) {
        console.log(err);
        return;
      }
      const rr = routes[0];
      if (!rr) return;
      steps.push(...rr.instructions);
    }
  );

  const routing = L.Routing.control({
    lineOptions: {
      styles: [
        {
          className: "stroke-[#007AFF] dark:stroke-[#00DAFF]",
        },
      ],
      extendToWaypoints: true,
      missingRouteTolerance: 200,
    },
    addWaypoints: false,
    fitSelectedRoutes: true,
    autoRoute: true,
    waypoints: coordinates,
    containerClassName: "hidden",
    router: L.Routing.osrmv1({
      // serviceUrl: "http://localhost:5000/route/v1",
      suppressDemoServerWarning: true,
    }),
  });

  routing.addTo(m);
  return {
    routing,
    steps,
  };
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
const [r, setR] = createSignal<any>(null);

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
                      <circle cx="6" cy="19" r="3" />
                      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                      <circle cx="18" cy="5" r="3" />
                    </svg>
                    <span class="text-md">Start a new Route {steps().length}</span>
                  </div>
                </div>
              }
            >
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const _r = r();
                  if (_r) _r.remove();
                  const _startLocation = await findLatLngForAddress(startLocation());
                  const _endLocation = await findLatLngForAddress(endLocation());
                  const s = routeTo([
                    L.latLng(_startLocation[0], _startLocation[1]),
                    L.latLng(_endLocation[0], _endLocation[1]),
                  ]);
                  if (!s) return;
                  setR(s.routing);
                  setSteps(s.steps);
                  setModalOpen(false);
                }}
                class="flex flex-col gap-4 h-min w-full"
              >
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
                    <button class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
                      <span>Start</span>
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
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </Modal>
          </Match>
          <Match when={steps().length > 0 && steps()}>
            {(s) => (
              <For each={s()}>
                {(step) => (
                  <div class="flex flex-col gap-2 w-max bg-white dark:bg-black px-4 py-2 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
                    {step.text}
                  </div>
                )}
              </For>
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
