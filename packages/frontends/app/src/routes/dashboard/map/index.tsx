import { Match, Suspense, Switch, createEffect, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { unstable_clientOnly as clientOnly } from "solid-start";
import { setStretchedHeader, stretchedHeader } from "../../../components/Header";

const Map = clientOnly(() => import("../../../components/Map").then((m) => ({ default: m.MapComponent })));

export default function MapPage() {
  onMount(() => {
    const oldHeader = stretchedHeader();

    setStretchedHeader(true);
    onCleanup(() => {
      setStretchedHeader(oldHeader);
    });
  });
  return (
    <div class="w-full h-full flex flex-col">
      <Switch>
        <Match when={isServer}>
          <div></div>
        </Match>
        <Match when={!isServer}>
          <Suspense
            fallback={
              <div class="flex flex-row w-full h-full items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span class="text-neutral-500 text-sm">Loading map...</span>
              </div>
            }
          >
            <Map />
          </Suspense>
        </Match>
      </Switch>
    </div>
  );
}
