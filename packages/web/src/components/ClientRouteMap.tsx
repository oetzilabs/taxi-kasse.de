import * as L from "leaflet";
// @ts-ignore
import polyline from "polyline-encoded";
import { Accessor, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import "leaflet/dist/leaflet.css";
import { useColorMode } from "@kobalte/core";
import { createStore } from "solid-js/store";

type ClientRouteMapProps = {
  from: Accessor<[number, number] | undefined>;
  to: Accessor<[number, number] | undefined>;
  geometry: Accessor<string | undefined>;
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

const ClientRouteMap = (props: ClientRouteMapProps) => {
  const { colorMode: theme } = useColorMode();
  let mapContainer: HTMLDivElement | undefined;
  const [map, setMap] = createSignal<L.Map | null>(null);
  let markers: L.Marker[] = [];
  let routeLayer: L.Polyline | null = null;

  onMount(() => {
    if (mapContainer) {
      const from = props.from();
      if (!from) return;
      const m = L.map(mapContainer).setView([from[0], from[1]], 11);
      setMap(m);
      tiles.light.addTo(m);
    }
  });

  createEffect(() => {
    const m = map();
    if (!m) return;

    // Clear existing markers from the map
    markers.forEach((marker) => marker.removeFrom(m));
    markers = [];

    // Get the latest from and to coordinates
    const from = props.from();
    const to = props.to();

    // Create markers for the from and to points
    if (!from || !to) return;
    markers = [
      L.marker([from[0], from[1]], { title: "Start Point" }).addTo(m),
      L.marker([to[0], to[1]], { title: "End Point" }).addTo(m),
    ];

    // Adjust view to show both markers
    adjustViewToMarkers(m, markers);
    const geometry = props.geometry();
    if (geometry) {
      drawRoute(m, geometry);
    }
  });

  const drawRoute = (map: L.Map, geometry: string) => {
    try {
      // Decode the polyline using the imported polyline package
      const latLngs = polyline.decode(geometry); // Decode the geometry
      const points = latLngs.map(([lat, lng]: [number, number]) => L.latLng(lat, lng)); // Convert to L.LatLng

      if (routeLayer) {
        routeLayer.removeFrom(map); // Clear existing route layer before adding a new one
      }

      const polylineLayer = L.polyline(points, {
        // color: "blue",
        className: "stroke-blue-500 dark:stroke-blue-400",
        weight: 4,
      }).addTo(map);

      routeLayer = polylineLayer;

      // Adjust the map view to fit the polyline bounds
      // map.fitBounds(polylineLayer.getBounds(), { padding: [20, 20] });
    } catch (error) {
      console.error("Error drawing route:", error);
    }
  };

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

  createEffect(() => {
    const geometry = props.geometry();
    const m = map();
    if (!m || !geometry) return;

    drawRoute(m, geometry);
  });

  // Clean up map and markers when component is unmounted
  onCleanup(() => {
    const m = map();
    if (m) {
      markers.forEach((marker) => marker.removeFrom(m));
      if (routeLayer) {
        routeLayer.removeFrom(m);
      }
      m.remove();
    }
  });

  return (
    <div
      class="w-full h-full grow flex flex-col items-center justify-center p-4 z-0 bg-neutral-50 dark:bg-neutral-900"
      ref={mapContainer}
    ></div>
  );
};

export default ClientRouteMap;
