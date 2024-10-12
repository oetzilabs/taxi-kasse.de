import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHotspots } from "@/lib/api/hotspots";
import { createAsync, revalidate } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import { For, Show, Suspense } from "solid-js";

export const Hotspots = () => {
  const hotspot = createAsync(() => getHotspots());
  return (
    <div class="flex flex-col h-full w-full border border-yellow-200 dark:border-yellow-400/10 rounded-2xl min-h-40 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 dark:from-yellow-100/50 dark:via-yellow-50/50 dark:to-yellow-200/50">
      <div class="p-4 flex-col flex h-full w-full grow gap-4">
        <div class="flex flex-row items-center justify-between gap-2">
          <span class="font-bold select-none">Hotspot</span>
          <div class="w-max flex flex-row items-center gap-2">
            <Button
              size="icon"
              class="md:flex flex-row items-center gap-2 size-8 hidden"
              variant="ghost"
              onClick={async () => {
                await revalidate([getHotspots.key]);
              }}
            >
              <RotateClockwise class="size-4" />
            </Button>
          </div>
        </div>
        <Suspense
          fallback={
            <div class="flex flex-col items-center justify-center w-full h-full">
              <Loader2 class="size-4 animate-spin" />
            </div>
          }
        >
          <Show
            when={hotspot() && hotspot()!.length > 0 && hotspot()}
            keyed
            fallback={
              <div class="flex flex-col gap-1 h-full grow bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-yellow-200 dark:border-yellow-300/20 shadow-sm select-none items-center justify-center">
                <span class="text-sm text-center">No Hotspot at the current time</span>
              </div>
            }
          >
            {(h) => (
              <div class="flex flex-row items-center">
                <For each={h} fallback={<Skeleton class="w-full h-full" />}>
                  {(v) => (
                    <div class="flex flex-row items-center gap-2">
                      <span>{v.points.join(", ")}</span>
                    </div>
                  )}
                </For>
              </div>
            )}
          </Show>
        </Suspense>
      </div>
    </div>
  );
};
