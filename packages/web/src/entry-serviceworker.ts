/// <reference lib="webworker" />
import type { PrecacheEntry } from "workbox-precaching";
import { cacheNames, setCacheNameDetails } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, Route } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;

export type Options = {
  assets?: Array<string | PrecacheEntry>;
  sha: string;
};

export function register(opts: Options) {
  setCacheNameDetails({
    prefix: "troon",
    suffix: "v0",
    precache: "pre",
    runtime: "run",
  });

  precache(opts.assets ?? ([] as Array<string>), opts.sha);

  const assets = new Route(
    ({ request }) => ["image", "font", "script", "style", "video"].includes(request.destination),
    new CacheFirst({
      cacheName: cacheNames.runtime,
    }),
  );

  registerRoute(assets);
}

function precache(assets: Array<string | PrecacheEntry>, _sha: string) {
  precacheAndRoute(assets.map((asset) => (typeof asset === "string" ? { url: asset, revision: null } : asset)));
}

// Become the active service worker immediately
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

// Claim all open clients (tabs)
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(async (key) => {
          if (key !== cacheNames.runtime) {
            await caches.delete(key);
          }
        }),
      );
    })(),
  );
});

// Console log messages
self.addEventListener("message", (event) => {
  console.log(event.data.message);
});

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_ASSETS__?: Array<string>;
  }
}
