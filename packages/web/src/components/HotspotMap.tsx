import dayjs from "dayjs";
import * as L from "leaflet";
import { Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import "leaflet/dist/leaflet.css";
import { useColorMode } from "@kobalte/core";
import { createStore } from "solid-js/store";

type HotspotClientMapProps<T> = {
  hotspots: Accessor<Array<T>>;
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

const HotspotMap = <
  T extends {
    points: Array<{ lat: number; lng: number; address: string }>;
    centroid: { lat: number; lng: number };
  },
>(
  props: HotspotClientMapProps<T>,
) => {
  const { colorMode: theme } = useColorMode();
  let mapContainer: HTMLDivElement | undefined;
  const [map, setMap] = createSignal<L.Map | null>(null);
  let markers: L.Marker[] = [];

  onMount(() => {
    if (mapContainer) {
      const hs = props.hotspots();
      if (hs.length === 0) return;
      const cent = props.hotspots()[0].centroid;
      const m = L.map(mapContainer).setView([cent.lat, cent.lng], 11);
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
    const hs = props.hotspots();
    if (hs.length === 0) return;

    // Create new markers and add them to the map
    markers = hs
      .map((hotspot) => {
        return hotspot.points.map((point) => {
          return L.marker([point.lat, point.lng], {});
        });
      })
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

export default HotspotMap;
