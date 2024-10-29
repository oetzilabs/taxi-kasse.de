import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/api/events";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync } from "@solidjs/router";
import { Accessor, createEffect, createSignal, For, onCleanup, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/utils";
import { useRealtime } from "./Realtime";

export const Events = () => {
  const events = createAsync(() => getEvents());
  return (
    <Suspense>
      <Show when={events() && events()}>{(ees) => <RealtimeHotspotButton eventsList={ees} />}</Show>
    </Suspense>
  );
};

type RealtimeHotspotButtonProps = {
  eventsList: Accessor<Array<any>>;
};

const RealtimeHotspotButton = (props: RealtimeHotspotButtonProps) => {
  const [es, setEs] = createSignal(props.eventsList());
  const rt = useRealtime();

  createEffect(() => {
    const ees = props.eventsList();
    setEs(ees);
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
      // console.log("realtime connected");
      const unsubHotspotCreated = rt.subscribe("event.created", (payload) => {
        // console.log("received system notification", payload);
        const concatted = concat(es, payload);
        setEs(concatted());
      });
      onCleanup(() => {
        unsubHotspotCreated();
      });
    }
  });

  return (
    <div class="flex flex-col w-full items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800">
      <Button
        as={A}
        variant="ghost"
        href="/dashboard/events"
        class={cn("flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3", {
          "rounded-b-none": es().length > 0,
        })}
      >
        <span class="font-bold">Events</span>
        <span class="font-bold">
          <Show when={es().length > 0} fallback="None">
            {es().length}
          </Show>
        </span>
      </Button>
      <For each={es()}>
        {(e, index) => {
          return (
            <Button
              as={A}
              href={`/dashboard/events/${e.id}`}
              variant="ghost"
              class={cn("flex flex-row w-full gap-2 items-center justify-between rounded-lg", {
                "rounded-t-none": index() == es().length - 1,
              })}
            >
              <span class="font-bold">{e.name}</span>
              <span class="">{e.description}</span>
            </Button>
          );
        }}
      </For>
    </div>
  );
};
