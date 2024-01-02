import solid from "solid-start/vite";
import { defineConfig } from "vite";
import aws from "solid-start-sst";

export default defineConfig({
  plugins: [solid({ adapter: aws() })],
  server: {
    port: 4000,
  },
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
    external: ["leaflet", "leaflet/dist/leaflet.css", "leaflet-routing-machine", "@solid-primitives/devices"],
  },
});