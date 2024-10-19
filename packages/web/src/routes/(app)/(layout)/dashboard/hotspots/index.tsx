import { RealtimeHotspotList } from "@/components/RealtimeHotspotList";
import { getLanguage } from "@/lib/api/application";
import { getHotspots } from "@/lib/api/hotspots";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, RouteDefinition } from "@solidjs/router";
import { RankingInfo } from "@tanstack/match-sorter-utils";
import { FilterFn } from "@tanstack/solid-table";
import { Show, Suspense } from "solid-js";

declare module "@tanstack/solid-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const language = await getLanguage();
    return { session, language };
  },
} satisfies RouteDefinition;

export default function HotspotListing() {
  const hotspots = createAsync(() => getHotspots());

  return (
    <div class="flex flex-col gap-4 w-full">
      <h1 class="text-2xl font-bold mb-4">Hotspots</h1>
      <Suspense
        fallback={
          <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
            <span>Loading...</span>
          </div>
        }
      >
        <Show when={hotspots() && hotspots()}>{(hs) => <RealtimeHotspotList hotspotsList={hs} />}</Show>
      </Suspense>
    </div>
  );
}
