// @refresh reload
import { useColorMode } from "@kobalte/core";
import L, { LatLngTuple } from "leaflet";
// import "leaflet-rotate";
// import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import Loader2 from "lucide-solid/icons/loader-2";
import { createEffect, createSignal, Match, onCleanup, onMount, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { Button } from "./ui/button";

type MapStore =
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
    };

const [mapStore, setMapStore] = makePersisted(
  createStore<MapStore>({
    type: "idle",
  }),
  {
    name: "main-map",
    storage: cookieStorage,
  },
);

const [map, setMap] = createSignal<L.Map | null>(null);

const [mapTiles, setMapTiles] = makePersisted(
  createStore<Record<string, L.TileLayer>>({
    dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      // maxZoom: 20,
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    }),
    light: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      // maxZoom: 20,
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    }),
  }),
  {
    name: "map-tiles",
    storage: cookieStorage,
  },
);

export default function Map() {
  let mapDiv: HTMLDivElement;

  const { colorMode } = useColorMode();

  const loadMap = () => {
    if (!mapDiv || mapStore.type !== "success") return;

    const m = L.map(mapDiv, {
      touchZoom: true,
      zoomControl: false,
    });

    m.setView(mapStore.coordinates);
    m.setZoom(16);
    setMap(m);
  };

  const startMap = () => {
    setMapStore({ type: "loading" });
    navigator.geolocation.watchPosition(
      (position) => {
        setMapStore({
          type: "success",
          coordinates: [position.coords.latitude, position.coords.longitude],
          zoom: 20,
          accuracy: position.coords.accuracy ?? 25,
        });
      },
      (error) => {
        toast.error("Error getting location", {
          description: error.message,
        });
        setMapStore({ type: "idle" });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  createEffect(() => {
    if (mapStore.type === "success") {
      loadMap();
    }
  });

  createEffect(() => {
    const m = map();
    if (!m) return;
    const themeMode = colorMode();
    if (themeMode === "dark") {
      mapTiles.dark.addTo(m);
      mapTiles.light.removeFrom(m);
    } else {
      mapTiles.light.addTo(m);
      mapTiles.dark.removeFrom(m);
    }
  });

  onCleanup(() => {
    const m = map();
    if (!m) return;
    m.remove();
    setMap(null);
  });

  return (
    <div class="flex flex-col gap-0 w-full grow relative z-0">
      <Switch>
        <Match when={mapStore.type === "loading"}>
          <div class="items-center justify-center flex flex-col w-full grow">
            <Loader2 class="size-8 animate-spin" />
            <span class="text-neutral-500 text-sm">Loading map...</span>
          </div>
        </Match>
        <Match when={mapStore.type === "idle"}>
          <div class="items-center justify-center flex flex-col w-full grow">
            <Button variant="secondary" onClick={startMap}>
              Load Map
            </Button>
          </div>
        </Match>
        <Match when={mapStore.type === "success"}>
          <div ref={mapDiv!} id="main-map" class="w-full h-full relative flex flex-col" />
        </Match>
      </Switch>
    </div>
  );
}
