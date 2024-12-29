import type { Calendar } from "@taxikassede/core/src/entities/calendar";
import { Button } from "@/components/ui/button";
// import { Weather } from "@/components/Weather";
import { getCalendar } from "@/lib/api/calendar";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, RouteDefinition, useParams } from "@solidjs/router";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import Loader2 from "lucide-solid/icons/loader-2";
import { createMemo, ErrorBoundary, For, Show, Suspense } from "solid-js";

dayjs.extend(isBetween);

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const calendar = await getCalendar();
    return { notification, session, calendar };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const params = useParams();
  const year = createMemo(() => (isNaN(Number(params.year)) ? new Date().getFullYear() : Number(params.year)));
  const options = createMemo(() => ({
    from: dayjs().year(year()).month(0).startOf("month").toDate(),
    to: dayjs().year(year()).month(11).endOf("month").toDate(),
  }));

  const calendar = createAsync(() => getCalendar(options()), { deferStream: true });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: dayjs().month(i).format("MMMM"),
  }));

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
                  <div class="flex flex-row w-full gap-2">
                    <Button size="sm" as={A} href="/dashboard" class="gap-2">
                      <ArrowLeft class="size-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                  </div>
                  <div class="grid grid-cols-3 gap-2 h-fit">
                    <Show when={calendar() && calendar()}>
                      {(drs) => (
                        <For each={months}>
                          {(m) => (
                            <A
                              href={`/dashboard/${year()}/${m.value + 1}`}
                              class={cn(
                                "flex flex-col gap-2 w-full items-center justify-center rounded-md px-4 py-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 h-fit",
                                {
                                  "bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700":
                                    m.value === dayjs().year() && year() === dayjs().month() + 1,
                                },
                              )}
                            >
                              <span class="font-bold text-lg">{m.label}</span>
                              <span>
                                {
                                  drs().filter((dr) =>
                                    dayjs(dr.date).isBetween(
                                      dayjs().year(year()).month(m.value).startOf("month"),
                                      dayjs().year(year()).month(m.value).endOf("month"),
                                    ),
                                  ).length
                                }{" "}
                                entries
                              </span>
                            </A>
                          )}
                        </For>
                      )}
                    </Show>
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
