import type { Orders } from "@taxikassede/core/src/entities/orders";
import { concat } from "@solid-primitives/signal-builders";
import { clientOnly } from "@solidjs/start";
import { Accessor, createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { useRealtime } from "./Realtime";
import { TextField, TextFieldRoot } from "./ui/textfield";

const ClientHotspotMap = clientOnly(() => import("@/components/HotspotMap"));

export const RealtimeHotspotList = (props: { hotspotsList: Accessor<Array<Orders.HotspotInfo>> }) => {
  const [hotspots, setHotspots] = createSignal(props.hotspotsList());
  const rt = useRealtime();
  const [globalFilter, setGlobalFilter] = createSignal("");

  const filteredData = createMemo(() => {
    return hotspots().filter((hotspot) => {
      const matchesSearch = hotspot.points.some((point) => {
        const address = point.address.toLowerCase();
        return address.includes(globalFilter().toLowerCase());
      });
      return matchesSearch;
    });
  });

  createEffect(() => {
    const rs = props.hotspotsList();
    setHotspots(rs);
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
      const unsubHotspotCreated = rt.subscribe("hotspot.created", (payload) => {
        const concatted = concat(hotspots, payload);
        setHotspots(concatted());
      });
      onCleanup(() => {
        unsubHotspotCreated();
      });
    }
  });

  return (
    <Show
      when={filteredData().length > 0 && filteredData()}
      fallback={
        <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip py-8">
          <span class="text-sm text-muted-foreground select-none">No hotspots found</span>
        </div>
      }
    >
      {(hs) => (
        <div class="flex flex-col gap-4 w-full">
          <div class="flex flex-col gap-4 w-full">
            <TextFieldRoot value={globalFilter()} onChange={(value) => setGlobalFilter(value)} class="max-w-sm">
              <TextField placeholder="Search hotspots..." class="max-w-sm" />
            </TextFieldRoot>
          </div>
          <span>{hs().length} Hotspots</span>
          <ClientHotspotMap
            hotspots={filteredData}
            fallback={
              <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
                <span>Loading...</span>
              </div>
            }
          />
        </div>
      )}
    </Show>
  );
};
