import dayjs from "dayjs";
import * as L from "leaflet";
import { Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import "leaflet/dist/leaflet.css";
import type { Events } from "@taxikassede/core/src/entities/events";
import { useColorMode } from "@kobalte/core";
import { createStore } from "solid-js/store";

type EventsClientMapProps<T> = {
  events: Accessor<Array<T>>;
};

const [tiles] = createStore<{
  dark: L.TileLayer;
  light: L.TileLayer;
}>({
  dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
  }),
  light: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
  }),
});

const EventsMap = <T extends Events.Info>(props: EventsClientMapProps<T>) => {
  const { colorMode: theme } = useColorMode();
  let mapContainer: HTMLDivElement | undefined;
  const [map, setMap] = createSignal<L.Map | null>(null);
  let markers: L.Marker[] = [];

  onMount(() => {
    if (mapContainer) {
      const hs = props.events();
      if (hs.length === 0) return;
      const origin = props.events()[0].origin;
      if (!origin) return;
      const m = L.map(mapContainer).setView([Number(origin.latitude), Number(origin.longitude)], 11);
      setMap(m);
      tiles.light.addTo(m);
    }
  });

  // Effect to manage the addition and removal of markers
  createEffect(() => {
    const m = map();
    if (!m) return;

    // Clear existing markers from the map
    markers.forEach((marker) => marker.removeFrom(m));
    markers = [];

    // Get the latest hotspots data
    const hs = props.events();
    if (hs.length === 0) return;

    // Create new markers and add them to the map

    markers = hs
      .filter((x) => x.origin !== null)
      .map((e) => L.marker([Number(e.origin!.latitude), Number(e.origin!.longitude)], {}))
      .flat();

    // Manually trigger a view adjustment after markers are set
    adjustViewToMarkers(m, markers);
  });

  // Function to adjust the view after the markers have been set
  const adjustViewToMarkers = (map: L.Map, markers: L.Marker[]) => {
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  createEffect(() => {
    const m = map();
    if (!m) return;
    const themeMode = theme();
    if (themeMode === "dark") {
      tiles.dark.addTo(m);
      tiles.light.removeFrom(m);
    } else {
      tiles.light.addTo(m);
      tiles.dark.removeFrom(m);
    }
  });

  // Clean up map and markers when component is unmounted
  onCleanup(() => {
    const m = map();
    if (m) {
      markers.forEach((marker) => marker.removeFrom(m));
      m.remove();
    }
  });

  return (
    <div
      class="w-full !aspect-video flex flex-col items-center justify-center p-4 z-0 border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip bg-neutral-50 dark:bg-neutral-900"
      ref={mapContainer}
    ></div>
  );
};

export default EventsMap;
