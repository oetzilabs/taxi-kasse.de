import type { Orders } from "@taxikassede/core/src/entities/orders";
import { Button } from "@/components/ui/button";
import { getHotspots } from "@/lib/api/hotspots";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync } from "@solidjs/router";
import { Accessor, createEffect, createSignal, For, onCleanup, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/utils";
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
      const unsubHotspotCreated = rt.subscribe("hotspot.created", (payload) => {
        const concatted = concat(hs, payload);
        setHs(concatted());
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
        href="/dashboard/hotspots"
        class={cn("flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3", {
          "rounded-b-none": hs().length > 0,
        })}
      >
        <span class="font-bold">Hotspots</span>
        <span class="font-bold">
          <Show when={hs().length > 0} fallback="None">
            {hs().length}
          </Show>
        </span>
      </Button>
      <For each={hs()}>
        {(h, index) => {
          return (
            <Button
              as={A}
              href={`/dashboard/hotspots/${h.id}`}
              variant="ghost"
              class={cn("flex flex-row w-full gap-2 items-center justify-between rounded-lg", {
                "rounded-t-none": index() == hs().length - 1,
              })}
            >
              <span class="font-bold">{h.summary}</span>
            </Button>
          );
        }}
      </For>
    </div>
  );
};
