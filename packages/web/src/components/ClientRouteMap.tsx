import * as L from "leaflet";
// @ts-ignore
import polyline from "polyline-encoded";
import { Accessor, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import "leaflet/dist/leaflet.css";
import { useColorMode } from "@kobalte/core";
import { createStore } from "solid-js/store";

type ClientRouteMapProps = {
  from: Accessor<{ lat: number; lng: number } | undefined>;
  to: Accessor<{ lat: number; lng: number } | undefined>;
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
  const [routeSteps, setRouteSteps] = createSignal<string[]>([]);
  let markers: L.Marker[] = [];
  let routeLayer: L.Polyline | null = null;

  onMount(() => {
    if (mapContainer) {
      const from = props.from();
      if (!from) return;
      const m = L.map(mapContainer).setView([from.lat, from.lng], 11);
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
      L.marker([from.lat, from.lng], { title: "Start Point" }).addTo(m),
      L.marker([to.lat, to.lng], { title: "End Point" }).addTo(m),
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

      const polylineLayer = L.polyline(points, {
        color: "blue",
        weight: 4,
      }).addTo(map);

      routeLayer = polylineLayer;

      // Adjust the map view to fit the polyline bounds
      // map.fitBounds(polylineLayer.getBounds(), { padding: [20, 20] });

      // Example step extraction (replace with actual logic)
      const steps = getStepsFromGeometry(geometry);
      setRouteSteps(steps);
    } catch (error) {
      console.error("Error drawing route:", error);
    }
  };

  // Example function to get steps from geometry
  const getStepsFromGeometry = (geometry: string): string[] => {
    // This is a placeholder implementation
    // If you have a way to extract steps from your routing API, do that here
    return ["Step 1: Start", "Step 2: Turn left", "Step 3: Arrive at destination"]; // Example steps
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
    const m = map();
    if (!m) return;
    // rerender the route steps when the geometry changes
    // first remove the old route layer
    if (routeLayer) {
      routeLayer.removeFrom(m);
    }
    const geometry = props.geometry();
    if (geometry) {
      drawRoute(m, geometry);
    }
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
