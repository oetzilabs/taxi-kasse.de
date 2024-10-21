import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/api/events";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync } from "@solidjs/router";
import { Accessor, createEffect, createSignal, onCleanup, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
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
      const subs = rt.subscriptions();
      if (subs.has("event.created")) {
        console.log("realtime already subscribed to hotspot.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("event.created", (payload) => {
        // console.log("received system notification", payload);
        const concatted = concat(es, payload);
        setEs(concatted());
      });

      onCleanup(() => {
        rt.unsubscribe("event.created");
      });
    }
  });

  return (
    <Button
      as={A}
      variant="outline"
      href="/dashboard/events"
      class="flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3"
    >
      <span class="font-bold">Events</span>
      <span class="">{es().length}</span>
    </Button>
  );
};
