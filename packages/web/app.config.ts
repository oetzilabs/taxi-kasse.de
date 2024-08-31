import path from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "aws-lambda",
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
      },
    },
  },
  vite: {
    ssr: {
      noExternal: ["@kobalte/core"],
      external: [
        "leaflet",
        "leaflet/dist/leaflet.css",
        "leaflet-routing-machine",
        "@solid-primitives/devices",
        "leaflet-rotate-map",
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
      },
    },
    build: {
      target: "esnext",
    },
  },
});
