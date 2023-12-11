import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import calendar from "dayjs/plugin/calendar";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Accessor, For, Match, Show, Switch, createSignal } from "solid-js";
import { Queries } from "../utils/api/queries";
import { CalendarUtils } from "../utils/calendar";
import { cn } from "../utils/cn";
import { useAuth } from "./Auth";
import { CalendarEntry, CalendarMonthEntry } from "./Entry";
import { NotSignedIn } from "./NotSignedIn";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(calendar);
dayjs.extend(isoWeek);

type CalendarProps = {
  range: () => {
    from: Date;
    to: Date;
  };
  filter: () => {
    [key: string]: any;
  };
  data: () =>
    | {
        view: "week";
        year: number;
        week: number;
        days: dayjs.Dayjs[];
      }
    | {
        view: "month";
        year: number;
        month: number;
        days: dayjs.Dayjs[];
      }
    | {
        view: "year";
        year: number;
        months: dayjs.Dayjs[];
      };
};

export const CalendarMonth = (props: {
  year: () => number;
  month: () => number;
  range: () => {
    from: Date;
    to: Date;
  };
}) => {
  const days = () =>
    CalendarUtils.createCalendarMonth({
      year: props.year(),
      month: props.month(),
    });

  const [auth] = useAuth();
  const calendar = createQuery(() => ({
    queryKey: ["calendar", props.range()],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.Users.Calendar.get(token, props.range());
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  }));
  const [currentHovered, setCurrentHovered] = createSignal<dayjs.Dayjs | undefined>(undefined);
  return (
    <Switch fallback={<NotSignedIn />}>
      <Match when={!auth.isLoading && auth.isAuthenticated}>
        <Show
          when={!calendar.isPending && calendar.isSuccess && calendar.data}
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
                <Match when={calendar.isPending}>
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
            <div class="flex flex-col w-full h-full">
              <div
                class={cn("grid grid-cols-7 grid-rows-5 w-full h-full", {
                  "grid-rows-6": days().length === 42,
                })}
              >
                <For each={days()}>
                  {(entry) => (
                    <div
                      class={cn("w-full h-full border-r border-b border-transparent", {
                        "bg-black dark:bg-white text-white dark:text-black dark:border-neutral-300": c().some((e) =>
                          dayjs(e.date).isSame(entry, "day")
                        ),
                        "opacity-50": entry.month() !== props.month(),
                        "hover:bg-neutral-100 dark:hover:bg-neutral-950": !c().some((e) =>
                          dayjs(e.date).isSame(entry, "day")
                        ),
                      })}
                      onMouseEnter={() => {
                        setCurrentHovered(entry);
                      }}
                      onMouseLeave={() => {
                        setCurrentHovered(undefined);
                      }}
                    >
                      <CalendarEntry
                        hovered={() => {
                          return currentHovered() === entry;
                        }}
                        date={entry}
                        entry={c().find((e) => dayjs(e.date).isSame(entry, "day"))}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </Match>
      <Match when={auth.isLoading}>
        <div
          class={cn("grid grid-cols-7 grid-rows-5 w-full h-full", {
            "grid-rows-6": days().length === 42,
          })}
        >
          <For each={days()}>
            {(days, index) => (
              <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950 border-r border-b border-neutral-200 dark:border-neutral-800"></div>
            )}
          </For>
        </div>
      </Match>
    </Switch>
  );
};

export const CalendarWeek = (props: {
  year: () => number;
  week: () => number;
  range: () => {
    from: Date;
    to: Date;
  };
}) => {
  const days = () => {
    let d = [];
    let startDay = dayjs(props.range().from);
    let endDay = dayjs(props.range().to);
    let diff = endDay.diff(startDay, "day");
    for (let i = 0; i < diff; i++) {
      d.push(startDay.add(i, "day"));
    }
    d.push(endDay);
    return d;
  };
  const [auth] = useAuth();
  const calendar = createQuery(() => ({
    queryKey: ["calendar", props.range()],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.Users.Calendar.get(token, props.range());
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  }));
  const [currentHovered, setCurrentHovered] = createSignal<dayjs.Dayjs | undefined>(undefined);
  return (
    <Switch fallback={<NotSignedIn />}>
      <Match when={!auth.isLoading && auth.isAuthenticated}>
        <Show
          when={!calendar.isPending && calendar.isSuccess && calendar.data}
          fallback={
            <div class="relative flex flex-col w-full h-full">
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
                <Match when={calendar.isPending}>
                  <div class="grid grid-cols-7 grid-rows-1 w-full h-full">
                    <For each={days()}>
                      {(days, index) => (
                        <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-300 dark:border-neutral-800"></div>
                      )}
                    </For>
                  </div>
                </Match>
              </Switch>
            </div>
          }
        >
          {(c) => (
            <div class="flex flex-col w-full h-full">
              <div class="grid grid-cols-7 grid-rows-1 w-full h-full">
                <For each={days()}>
                  {(entry) => (
                    <div
                      class={cn("w-full h-full border-r border-b border-neutral-300 dark:border-neutral-800", {
                        "bg-black dark:bg-white text-white dark:text-black dark:border-neutral-300": c().some((e) =>
                          dayjs(e.date).isSame(entry, "day")
                        ),
                        "hover:bg-neutral-100 dark:hover:bg-neutral-950": !c().some((e) =>
                          dayjs(e.date).isSame(entry, "day")
                        ),
                      })}
                      onMouseEnter={() => {
                        setCurrentHovered(entry);
                      }}
                      onMouseLeave={() => {
                        setCurrentHovered(undefined);
                      }}
                    >
                      <CalendarEntry
                        hovered={() => {
                          return currentHovered() === entry;
                        }}
                        date={entry}
                        entry={c().find((e) => dayjs(e.date).isSame(entry, "day"))}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </Match>
      <Match when={auth.isLoading}>
        <div class="grid grid-cols-7 grid-rows-1 w-full h-full">
          <For each={days()}>
            {(days, index) => (
              <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-300 dark:border-neutral-800"></div>
            )}
          </For>
        </div>
      </Match>
    </Switch>
  );
};

export const CalendarYear = (props: {
  year: Accessor<number>;
  range: Accessor<{
    from: Date;
    to: Date;
  }>;
}) => {
  const months = () =>
    CalendarUtils.createCalendarYear({
      year: props.year(),
    });

  const [auth] = useAuth();
  const calendar = createQuery(() => ({
    queryKey: ["calendar", props.range()],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.Users.Calendar.get(token, props.range());
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  }));
  const [currentHovered, setCurrentHovered] = createSignal<dayjs.Dayjs | undefined>(undefined);
  return (
    <Switch fallback={<NotSignedIn />}>
      <Match when={!auth.isLoading && auth.isAuthenticated}>
        <Show
          when={!calendar.isPending && calendar.isSuccess && calendar.data}
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
                <Match when={calendar.isPending}>
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
            <div class="flex flex-col w-full h-full">
              <div class="grid grid-cols-4 grid-rows-3 w-full h-full">
                <For each={months()}>
                  {(entry) => (
                    <div
                      class={cn("w-full h-full border-r border-b border-transparent", {
                        "bg-black dark:bg-white text-white dark:text-black dark:border-neutral-300": c().some((e) =>
                          dayjs(e.date).isSame(entry, "month")
                        ),
                        "opacity-50": entry.year() !== props.year(),
                        "hover:bg-neutral-100 dark:hover:bg-neutral-950": !c().some((e) =>
                          dayjs(e.date).isSame(entry, "month")
                        ),
                      })}
                      onMouseEnter={() => {
                        setCurrentHovered(entry);
                      }}
                      onMouseLeave={() => {
                        setCurrentHovered(undefined);
                      }}
                    >
                      <CalendarMonthEntry
                        hovered={() => {
                          return currentHovered() === entry;
                        }}
                        date={entry}
                        entry={c().find((e) => dayjs(e.date).isSame(entry, "month"))}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </Match>
      <Match when={auth.isLoading}>
        <div class="grid grid-cols-4 grid-rows-3 w-full h-full">
          <For each={months()}>
            {(days, index) => <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950"></div>}
          </For>
        </div>
      </Match>
    </Switch>
  );
};
