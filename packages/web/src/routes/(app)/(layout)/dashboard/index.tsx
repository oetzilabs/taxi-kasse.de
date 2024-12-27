import { Events } from "@/components/Events";
import { Hotspots } from "@/components/Hotspots";
import { RealtimeDailyRecordsList } from "@/components/RealtimeDailyRecodsList";
import { RealtimeRidesList } from "@/components/RealtimeRidesList";
// import { Weather } from "@/components/Weather";
import { Statistic } from "@/components/Statistics";
import { getCalendar } from "@/lib/api/calendar";
import { getHotspots } from "@/lib/api/hotspots";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import dayjs from "dayjs";
import Loader2 from "lucide-solid/icons/loader-2";
import { For, Show, Suspense } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const calendar = await getCalendar();
    const hotspot = await getHotspots();
    return { notification, session, hotspot, calendar };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const calendar = createAsync(() => getCalendar());
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
