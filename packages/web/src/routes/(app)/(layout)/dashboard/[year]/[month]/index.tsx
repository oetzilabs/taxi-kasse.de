import { RealtimeDailyRecordsList } from "@/components/RealtimeDailyRecodsList";
import { Button } from "@/components/ui/button";
// import { Weather } from "@/components/Weather";
import { getCalendar } from "@/lib/api/calendar";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, useParams } from "@solidjs/router";
import dayjs from "dayjs";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import Loader2 from "lucide-solid/icons/loader-2";
import { createMemo, Show, Suspense } from "solid-js";

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
  const year = createMemo(() => Number(params.year));
  const mNumber = createMemo(() => (isNaN(Number(params.month)) ? 0 : Number(params.month)));
  const month = createMemo(() => Math.max(mNumber() - 1, 0));
  const from = createMemo(() => dayjs().year(year()).month(month()).startOf("month").toDate());
  const to = createMemo(() => dayjs().year(year()).month(month()).endOf("month").toDate());

  const calendar = createAsync(() => getCalendar({ from: from(), to: to() }));

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
                      <A
                        href={(c().website ?? "").trim().length > 0 ? c().website!.trim() : "#"}
                        class="text-xs font-medium text-muted-foreground"
                      >
                        {(c().website ?? "").trim().length > 0 ? c().website!.trim() : "No website set"}
                      </A>
                      <span class="text-xs font-medium text-muted-foreground">{c().email}</span>
                    </div>
                  </div>
                  <div class="flex flex-col w-full gap-4 grow">
                    <Suspense
                      fallback={
                        <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                          <Loader2 class="size-4 animate-spin" />
                        </div>
                      }
                    >
                      <Show when={calendar() && calendar()}>
                        {(drs) => (
                          <RealtimeDailyRecordsList daily_records_list={drs} session={s} year={year} month={month} />
                        )}
                      </Show>
                    </Suspense>
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
