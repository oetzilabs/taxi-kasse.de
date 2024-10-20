import type { Events } from "@taxikassede/core/src/entities/events";
import { A } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import Pen from "lucide-solid/icons/pen";
import Plus from "lucide-solid/icons/plus";
import { Accessor, createEffect, createSignal, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { useRealtime } from "./Realtime";
import { Button } from "./ui/button";

const ClientEventMap = clientOnly(() => import("@/components/EventMap"));

export const RealtimeEvent = (props: { event: Accessor<Events.Info> }) => {
  const [event, setEvent] = createSignal(props.event());
  const rt = useRealtime();

  createEffect(() => {
    const rs = props.event();
    setEvent(rs);
  });

  createEffect(() => {
    if (isServer) {
      console.log("realtime not available on server");
      return;
    }
    const connected = rt.isConnected();
    if (!connected) {
      console.log("realtime not connected");
      return;
    } else {
      const subs = rt.subscriptions();
      if (subs.has("event.updated")) {
        console.log("realtime already subscribed to event.updated, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("event.updated", (payload) => {
        // console.log("received system notification", payload);

        setEvent(payload);
      });

      onCleanup(() => {
        rt.unsubscribe("event.updated");
      });
    }
  });

  return (
    <Show
      when={event() && event()}
      fallback={
        <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip py-8 gap-4">
          <span class="text-sm text-muted-foreground select-none">This Event does not exist</span>
          <Button size="sm" as={A} href="/dashboard/events/create" variant="outline" class=" gap-2">
            <span class="">Create Event</span>
            <Plus class="size-4" />
          </Button>
        </div>
      }
    >
      {(e) => (
        <div class="flex flex-col gap-4 w-full">
          <Show
            when={e().origin}
            fallback={
              <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip py-8 gap-4">
                <span class="text-sm text-muted-foreground select-none">This Event does not have a location</span>
                <Button size="sm" as={A} href={`/dashboard/events/${e().id}/edit`} variant="outline" class=" gap-2">
                  <span class="">Edit Event</span>
                  <Pen class="size-4" />
                </Button>
              </div>
            }
          >
            <ClientEventMap
              event={e}
              fallback={
                <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
                  <span>Loading...</span>
                </div>
              }
            />
          </Show>
          <div class="flex flex-col gap-0 w-full">
            <div
              class="flex flex-col w-full h-full prose dark:prose-invert prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-sm dark:prose-p:text-white prose-p:m-1 prose-p:leading-1 prose-neutral prose-li:marker:text-black dark:prose-li:marker:text-white prose-li:marker:font-medium"
              innerHTML={e().contentHTML}
            />
          </div>
        </div>
      )}
    </Show>
  );
};
