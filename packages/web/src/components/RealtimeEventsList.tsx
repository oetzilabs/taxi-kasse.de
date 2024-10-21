import type { Events } from "@taxikassede/core/src/entities/events";
import { concat, filter, remove, removeItems } from "@solid-primitives/signal-builders";
import { A } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import dayjs from "dayjs";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Plus from "lucide-solid/icons/plus";
import { Accessor, createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/utils";
import { useRealtime } from "./Realtime";
import { Button } from "./ui/button";
import { TextField, TextFieldRoot } from "./ui/textfield";

const ClientEventsMap = clientOnly(() => import("@/components/EventsMap"));

export const RealtimeEventsList = (props: { eventsList: Accessor<Array<Events.Info>> }) => {
  const [events, setEvents] = createSignal(props.eventsList());
  const rt = useRealtime();
  const [globalFilter, setGlobalFilter] = createSignal("");

  const filteredData = createMemo(() => {
    if (globalFilter().length > 0) {
      return events()
        .filter((e) => {
          let found = e.origin?.streetname.toLowerCase().includes(globalFilter().toLowerCase());
          found = e.name.toLowerCase().includes(globalFilter().toLowerCase()) || found;
          found = e.description.toLowerCase().includes(globalFilter().toLowerCase()) || found;
          found = e.contentText.toLowerCase().includes(globalFilter().toLowerCase()) || found;
          return found;
        })
        .sort((b, a) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
    }
    return events().sort((b, a) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
  });

  createEffect(() => {
    const rs = props.eventsList();
    setEvents(rs);
  });

  createEffect(() => {
    if (isServer) {
      console.log("realtime not available on server");
      return;
    }
    const connected = rt.isConnected();
    if (!connected) {
      return;
    } else {
      const subs = rt.subscriptions();
      if (subs.has("event")) {
        console.log("realtime already subscribed to event.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("event", (payload, action) => {
        switch (action) {
          case "created":
            // console.log("received system notification", payload);
            const concatted = concat(events, payload);
            setEvents(concatted());
            break;
          case "updated":
            // replace the event with the updated one
            const oldEvent = events().find((e) => e.id === payload.id);
            if (!oldEvent) return;
            const newEvent = payload;
            const index = events().findIndex((e) => e.id === payload.id);
            setEvents(events().map((e, i) => (i === index ? newEvent : e)));
            break;
          case "deleted":
            const filtered = filter(events, (e) => e.id !== payload.id);
            setEvents(filtered());
            break;
          default:
            console.log("unknown action", action);
            break;
        }
      });
    }
  });

  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-4 w-full">
        <TextFieldRoot value={globalFilter()} onChange={(value) => setGlobalFilter(value)} class="max-w-sm">
          <TextField placeholder="Search hotspots..." class="max-w-sm" />
        </TextFieldRoot>
      </div>
      <Show
        when={filteredData().length > 0 && filteredData()}
        fallback={
          <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip py-8 gap-4">
            <span class="text-sm text-muted-foreground select-none">No events found</span>
            <Button size="sm" as={A} href="/dashboard/events/create" variant="outline" class=" gap-2">
              <span class="">Create Event</span>
              <Plus class="size-4" />
            </Button>
          </div>
        }
      >
        {(es) => (
          <div class="flex flex-col gap-4 w-full pb-10">
            <ClientEventsMap
              events={filteredData}
              fallback={
                <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
                  <span>Loading...</span>
                </div>
              }
            />
            <div class="flex flex-col gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-clip">
              <For each={filteredData()}>
                {(e, index) => (
                  <div
                    class={cn(
                      "w-full flex flex-row gap-2 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 p-4",
                      {
                        "border-none": index() === filteredData().length - 1,
                      },
                    )}
                  >
                    <span class="text-sm font-bold select-none">{e.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      class="flex flex-row items-center gap-2"
                      as={A}
                      href={`/dashboard/events/${e.id}`}
                    >
                      <span>View</span>
                      <ChevronRight class="size-4" />
                    </Button>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
