import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { useAuth } from "../../components/Auth";
import { Queries } from "../../utils/api/queries";
dayjs.extend(relativeTime);

interface Stat {
  label: (value: this["value"]) => string;
  value: number | string | Array<string> | Array<number>;
}

const stats: Array<Stat> = [
  {
    label: (value) => `${value} drives`,
    value: 20, // 20 drives
  },
  {
    label: (value) => `${value} distance`,
    value: 20 * 12, // 12 km per drive, 20 drives
  },
  {
    label: (value) => `${value} CHF revenue`,
    value: 6.8 * 20 + 3.4 * (20 * 12) + 20 * 0.25, // base: 6.8, per km: 3.4, per minute: 0.25
  },
  {
    label: (value) => `${value} min. driven`,
    value: 20 * 15, // 15 minutes * 20 drives
  },
];

const calendarEntries: Array<{
  date: Date;
  entries: number;
  revenue: number;
}> = [
  {
    date: dayjs().subtract(3, "day").startOf("day").toDate(),
    entries: 40,
    revenue: 40 * 6.8 + 40 * 3.4 * 12 + 40 * 0.25,
  },
  {
    date: dayjs().subtract(2, "day").startOf("day").toDate(),
    entries: 14,
    revenue: 14 * 6.8 + 14 * 3.4 * 12 + 14 * 0.25,
  },
  {
    date: dayjs().subtract(1, "day").startOf("day").toDate(),
    entries: 8,
    revenue: 8 * 6.8 + 8 * 3.4 * 12 + 8 * 0.25,
  },
  {
    date: dayjs().subtract(0, "day").startOf("day").toDate(),
    entries: 7,
    revenue: 7 * 6.8 + 7 * 3.4 * 12 + 7 * 0.25,
  },
];

export default function Dashboard() {
  const [auth] = useAuth();
  const [rangeDate, setRangeDate] = createSignal(dayjs().subtract(3, "day").startOf("day").toDate());
  const company = createQuery(() => ({
    queryKey: ["company"],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.company(token);
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    refetchInterval: 1000 * 5,
    keepPreviousData: true,
  }));

  createEffect(() => {
    // set the title of the page

    if (!company.isSuccess) return;
    if (!company.data.company) {
      document.title = `Dashboard - Not found`;
      return;
    }
    document.title = `Dashboard - ${company.data.company.name}`;
  });

  return (
    <Switch
      fallback={
        <div class="flex flex-col gap-4 items-center p-0 md:p-4 md:py-10 h-full">
          <div class="w-full md:w-auto h-full md:h-auto relative flex flex-col gap-6 items-center justify-center bg-neutral-50/50 p-16 px-28 dark:bg-black border-0 md:border border-neutral-200 dark:border-neutral-800 rounded-md md:shadow-sm shadow-none select-none">
            <div class="text-neutral-300 dark:text-neutral-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
                <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M2 16h.01" />
                <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
              </svg>
            </div>
            <div class="text-xl font-bold">Seems like you're not logged in</div>
            <div class="flex flex-col gap-4 items-center">
              <div class="text-sm font-medium">You need to be logged in to access this page.</div>
              <div class="text-sm opacity-30">If you don't have an account, you can create one for free.</div>
            </div>
            <div class="text-md font-medium pt-4 gap-4 flex flex-row">
              <A href="/" class="text-sm bg-neutral-200 dark:bg-neutral-900 px-4 py-2 rounded-md shadow-sm">
                Go Home
              </A>
              <A href="/login" class="text-sm text-white bg-blue-900 px-4 py-2 rounded-md shadow-sm">
                Sign in
              </A>
            </div>
          </div>
        </div>
      }
    >
      <Match when={!auth.isLoading && auth.isAuthenticated}>
        <Show
          when={!company.isLoading && company.isSuccess && company.data.company}
          fallback={
            <div class="relative flex flex-col">
              <Switch
                fallback={
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-4">
                      <div class="relative flex flex-col">
                        <div class="flex flex-col gap-2">
                          <div class="text-2xl font-bold">Error</div>
                          <div class="text-xl font-bold">Something went wrong</div>
                          <div class="text-sm">An unexpected error occurred, please retry in a few minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <Match when={company.isLoading || company.isFetching}>
                  <div class="flex flex-col gap-4 w-full h-full items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </div>
                </Match>
              </Switch>
            </div>
          }
        >
          {(c) => (
            <div class="flex flex-col gap-8 p-8">
              <div class="text-2xl font-bold">Welcome back, {auth.user?.name}</div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center justify-between w-full">
                  <A href="./stats" class="flex flex-row text-xl font-bold gap-2 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    Stats for this week
                  </A>
                  <div class="flex flex-row gap-2 w-max">
                    <A
                      href="/dashboard/stats/settings"
                      class="flex flex-row gap-2 items-center justify-center cursor-pointer bg-transparent dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-900 rounded-md p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M20 7h-9" />
                        <path d="M14 17H5" />
                        <circle cx="17" cy="17" r="3" />
                        <circle cx="7" cy="7" r="3" />
                      </svg>
                    </A>
                  </div>
                </div>
                <div class="flex flex-wrap flex-row w-full gap-2">
                  <For each={stats}>
                    {(stat) => (
                      <div class="bg-white dark:bg-black shadow-sm rounded-md flex flex-col gap-1 p-2 border border-neutral-200 dark:border-neutral-900 w-max items-center justify-center select-none">
                        <div class="text-sm font-bold">{stat.label(stat.value)}</div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center justify-between w-full">
                  <A href="./calendar" class="flex flex-row text-xl font-bold gap-2 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                      <path d="M17 14h-6" />
                      <path d="M13 18H7" />
                      <path d="M7 14h.01" />
                      <path d="M17 18h.01" />
                    </svg>
                    Calendar
                  </A>
                  <div class="flex flex-row gap-2 w-max">
                    <A
                      href="/dashboard/calendar/settings"
                      class="flex flex-row gap-2 items-center justify-center cursor-pointer bg-transparent dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-900 rounded-md p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class=""
                      >
                        <path d="M20 7h-9" />
                        <path d="M14 17H5" />
                        <circle cx="17" cy="17" r="3" />
                        <circle cx="7" cy="7" r="3" />
                      </svg>
                    </A>
                  </div>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 w-full gap-2">
                  <For each={calendarEntries}>
                    {(entry) => (
                      <div class="w-full p-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex-col justify-start items-start inline-flex rounded-md gap-2 select-none shadow-sm">
                        <div class="text-xs font-medium">{dayjs(entry.date).format("dddd")}</div>
                        <div class="self-stretch justify-between items-start inline-flex">
                          <div class="justify-start items-start gap-1 flex">
                            <div class="w-full h-full relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-car"
                              >
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                                <circle cx="7" cy="17" r="2" />
                                <path d="M9 17h6" />
                                <circle cx="17" cy="17" r="2" />
                              </svg>
                            </div>
                            <div class="text-xs font-medium">{entry.entries}</div>
                          </div>
                          <div class="justify-end items-start gap-2.5 flex">
                            <div class="text-xs font-medium">{Math.floor(entry.revenue)} CHF</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          )}
        </Show>
      </Match>
      <Match when={auth.isLoading}>
        <div class="w-full h-full flex items-center justify-center">
          <div class="flex flex-row gap-2 items-center justify-center text-neutral-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span class="text-sm">Loading</span>
          </div>
        </div>
      </Match>
    </Switch>
  );
}
