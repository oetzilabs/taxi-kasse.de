import type { StatisticsResponse, StatisticsSimple } from "@/lib/api/statistics";
import { Events } from "@/components/Events";
import { Hotspots } from "@/components/Hotspots";
import { RealtimeDailyRecordsList } from "@/components/RealtimeDailyRecodsList";
import { RealtimeRidesList } from "@/components/RealtimeRidesList";
// import { Weather } from "@/components/Weather";
import { Statistic } from "@/components/Statistics";
import { getCalendar } from "@/lib/api/calendar";
import { getHotspots } from "@/lib/api/hotspots";
import { getStatistics } from "@/lib/api/statistics";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import dayjs from "dayjs";
import Loader2 from "lucide-solid/icons/loader-2";
import { For, Show, Suspense } from "solid-js";

const STAT_OPTION = { type: "simple" } as {
  type: StatisticsResponse["type"];
};

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const hotspot = await getHotspots();
    const statistics = await getStatistics(STAT_OPTION);
    return { notification, session, hotspot, statistics };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const statistics = createAsync(() => getStatistics(STAT_OPTION), { deferStream: true });
  const startYear = 2024;
  const years = Array.from({ length: 9 }, (_, i) => {
    const year = startYear + i;
    return { value: year, label: year.toString() };
  });

  return (
    <div class="w-full grow flex flex-col">
      <Suspense
        fallback={
          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <Show when={session() && session()}>
          {(s) => (
            <Show
              when={s().company}
              fallback={
                <div class="flex flex-col w-full py-4 gap-4">
                  <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                    <span class="text-sm">You currently have no organizations.</span>
                    <span class="text-sm">
                      Please{" "}
                      <A href="/dashboard/organizations/add" class="hover:underline text-blue-500 font-medium">
                        create/join an organization
                      </A>{" "}
                      to view your dashboard
                    </span>
                  </div>
                </div>
              }
            >
              {(c) => (
                <div class="flex flex-col w-full gap-4 grow relative py-2">
                  <div class="flex flex-col w-full gap-2 ">
                    <h2 class="font-bold leading-none">{c().name}</h2>
                    <div class="flex flex-row items-center gap-2">
                      <A href={c().website ?? "#"} class="text-xs font-medium text-muted-foreground">
                        {c().website}
                      </A>
                      <span class="text-xs font-medium text-muted-foreground">{c().email}</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <Suspense>
                      <Show when={statistics() && statistics()}>
                        {(st) => (
                          <Show when={st().type === "simple" && (st() as unknown as StatisticsSimple)}>
                            {(sst) => (
                              <div class="w-full h-fit flex flex-row items-end justify-between bg-black dark:bg-white rounded-sm text-white dark:text-black p-2 select-none">
                                <div class="flex flex-col items-start justify-end w-full">
                                  <span class="text-6xl font-black font-mono leading-none">{sst().total_revenue}</span>
                                </div>
                                <div class="flex flex-col w-max text-xs items-start justify-end flex-1">
                                  <div class="flex flex-row w-max items-end justify-end gap-1">
                                    <span class="font-bold w-max text-right">{sst().days_worked}</span>
                                    <span class="text-muted-foreground w-max flex flex-1">days worked</span>
                                  </div>
                                  <div class="flex flex-row w-max items-end justify-end gap-1">
                                    <span class="font-bold w-max text-right">{sst().tours}</span>
                                    <span class="text-muted-foreground w-max flex flex-1">tours</span>
                                  </div>
                                  <div class="flex flex-row w-max items-end justify-end gap-1">
                                    <span class="font-bold  w-max text-right">
                                      {sst().occupied_distance}km/{sst().total_distance}km
                                    </span>
                                    <span class="text-muted-foreground w-fit flex flex-1">Distance (KM)</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Show>
                        )}
                      </Show>
                    </Suspense>
                  </div>
                  <div class="grid grid-cols-3 gap-2 h-fit">
                    <For each={years}>
                      {(y) => (
                        <A
                          href={`/dashboard/${y.value}`}
                          class={cn(
                            "flex flex-col gap-2 w-full items-center justify-center rounded-md px-4 py-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 h-fit",
                            {
                              "bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700":
                                y.value === dayjs().year(),
                            },
                          )}
                        >
                          {y.label}
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </Show>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
