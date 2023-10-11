import solid from "solid-start/vite";
import { defineConfig } from "vite";
import aws from "solid-start-sst";
import devtools from "@solid-devtools/transform";

export default defineConfig({
  plugins: [devtools({ autoname: true }), solid({ adapter: aws() })],
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
});
