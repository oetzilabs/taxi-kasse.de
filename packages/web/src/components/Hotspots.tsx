import { Button } from "@/components/ui/button";
import { getHotspots } from "@/lib/api/hotspots";
import { A, createAsync } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import { Show, Suspense } from "solid-js";

export const Hotspots = () => {
  const hotspots = createAsync(() => getHotspots());
  return (
    <Button as={A} variant="outline" href="/dashboard/hotspots" class="flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3">
      <span class="font-bold">Hotspots</span>
      <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
        <Show when={hotspots() && hotspots()}>{(hs) => <span class="">{hs().length}</span>}</Show>
      </Suspense>
    </Button>
  );
};
