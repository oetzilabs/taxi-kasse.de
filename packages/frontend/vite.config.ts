import solid from "solid-start/vite";
import { defineConfig } from "vite";
import aws from "solid-start-sst";
import devtools from "@solid-devtools/transform";

export default defineConfig({
  plugins: [solid({ adapter: aws() }), devtools({ autoname: true })],
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
});
