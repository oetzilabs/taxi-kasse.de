import path from "node:path";
import { defineConfig } from "@solidjs/start/config";
/* @ts-ignore */
import pkg from "@vinxi/plugin-mdx";
import devtools from "solid-devtools/vite";

const { default: mdx } = pkg;

export default defineConfig({
  server: {
    preset: "aws-lambda",
    awsLambda: {
      streaming: true,
    },
  },
  middleware: "./src/middleware.ts",
  vite: {
    ssr: {
      noExternal: ["@kobalte/core"],
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
    plugins: [
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
      mdx.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
      }),
    ],
  },
});
