import { getEvents } from "@/lib/api/events";
import { createAsync, revalidate } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import { Show, Suspense } from "solid-js";
import { Button } from "./ui/button";

type EventsProps = {};

export const Events = (props: EventsProps) => {
  const events = createAsync(() => getEvents());
  return (
    <div class="flex flex-col h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl min-h-40">
      <div class="p-4 flex-col flex h-full w-full grow gap-4">
        <div class="flex flex-row items-center justify-between gap-2">
          <span class="font-bold select-none">Events</span>
          <div class="w-max flex flex-row items-center gap-2">
            <Button
              size="icon"
              class="flex flex-row items-center gap-2 size-6"
              variant="ghost"
              onClick={async () => {
                await revalidate([getEvents.key]);
              }}
            >
              <RotateClockwise class="size-3" />
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
            when={events() && events()}
            keyed
            fallback={
              <div class="flex flex-col gap-1 h-full grow bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-neutral-200 dark:border-neutral-800 shadow-sm select-none items-center justify-center">
                <span class="text-sm text-center">No Events available</span>
              </div>
            }
          >
            {(w) => <div class="flex flex-row items-center"></div>}
          </Show>
        </Suspense>
      </div>
    </div>
  );
};
