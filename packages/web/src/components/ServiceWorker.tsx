import type { ParentProps } from "solid-js";
import { isServer } from "solid-js/web";

const swFile = import.meta.env.MODE === "production" ? "/sw.js" : undefined; //'/dev-sw.js?dev-sw';

export function ServiceWorker(props: ParentProps) {
  if (!isServer) {
    if ("serviceWorker" in navigator) {
      if (swFile) {
        navigator.serviceWorker.register(swFile, { type: import.meta.env.DEV ? "module" : "classic" }).catch((e) => {
          // log…
        });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
    }
  }

  return props.children;
}
