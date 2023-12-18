import L, { LatLngTuple } from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { Match, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { RouteProvider } from "./Route";
import { RouteControl } from "./RouteControl";
import { ThemeColors, useTheme } from "./theme";

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
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  })
);

const [lightTile] = createSignal<L.TileLayer>(
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  })
);

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
    m = L.map(div, {
      touchZoom: true,
      zoomControl: false,
    }).setView(coordinates, zoom);
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

  return (
    <RouteProvider>
      <div class="w-full h-full relative flex flex-col">
        <div class="absolute z-[40] md:top-2 md:left-2 top-0 left-0">
          <RouteControl map={map()} />
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
    </RouteProvider>
  );
};
