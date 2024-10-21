import type { Orders } from "@taxikassede/core/src/entities/orders";
import { Button } from "@/components/ui/button";
import { getHotspots } from "@/lib/api/hotspots";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync } from "@solidjs/router";
import { Accessor, createEffect, createSignal, onCleanup, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { useRealtime } from "./Realtime";

export const Hotspots = () => {
  const hotspots = createAsync(() => getHotspots());
  return (
    <Suspense>
      <Show when={hotspots() && hotspots()}>{(hs) => <RealtimeHotspotButton hotspotsList={hs} />}</Show>
    </Suspense>
  );
};

type RealtimeHotspotButtonProps = {
  hotspotsList: Accessor<Array<Orders.HotspotInfo>>;
};

const RealtimeHotspotButton = (props: RealtimeHotspotButtonProps) => {
  const [hs, setHs] = createSignal(props.hotspotsList());
  const rt = useRealtime();

  createEffect(() => {
    const hs = props.hotspotsList();
    setHs(hs);
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
      if (subs.has("hotspot.*")) {
        console.log("realtime already subscribed to hotspot.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("hotspot.*", (payload, action) => {
        switch (action) {
          case "created":
            // console.log("received system notification", payload);
            const concatted = concat(hs, payload);
            setHs(concatted());
            break;
          default:
            console.log("unknown action", action);
            break;
        }
      });

      onCleanup(() => {
        rt.unsubscribe("hotspot.*");
      });
    }
  });

  return (
    <Button
      as={A}
      variant="outline"
      href="/dashboard/hotspots"
      class="flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3"
    >
      <span class="font-bold">Hotspots</span>
      <span class="">{hs().length}</span>
    </Button>
  );
};
