import { HoverCard, Popover, TextField } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { For, Match, Show, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { useAuth } from "../../../components/Auth";
import { Queries } from "../../../utils/api/queries";
import { cn } from "../../../utils/cn";
import { CalendarDate, getWeeksInMonth } from "@internationalized/date";
import { daysInWeek, getMonthsInYear, monthWeeks } from "../../../utils/calendar";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

export default function Calendar() {
  const [auth] = useAuth();
  const [rangeDate, setRangeDate] = createSignal({
    from: dayjs().startOf("week").toDate(),
    to: dayjs().endOf("week").toDate(),
  });
  const [search, setSearch] = createSignal("");
  const setSearchDebounced = debounce(setSearch, 500);
  const calendar = createQuery(() => ({
    queryKey: ["calendar"],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.Users.Calendar.get(token, rangeDate());
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  }));

  const [view, setView] = createSignal<"timeline" | "grid">("grid");

  createEffect(() => {
    document.title = `Calendar: ${dayjs(rangeDate().from).format("Do MMM")} - ${dayjs(rangeDate().to).format(
      "Do MMM YYYY"
    )}`;
    // search keybind

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch("");
      }
      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        input!.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const [openView, setOpenView] = createSignal(false);

  let input: HTMLInputElement;

  const weeks = () => monthWeeks(dayjs(rangeDate().from).startOf("month"));
  const monthsInYear = () => getMonthsInYear(dayjs(rangeDate().from).startOf("year"));

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
        <div class="w-full p-2.5 bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-800 justify-center items-center gap-2.5 inline-flex">
          <div class="justify-end items-center gap-2.5 flex">
            <div class="justify-start items-center gap-2.5 flex">
              <TextField.Root
                class="px-2 py-1.5 bg-white dark:bg-black rounded-md border border-neutral-300 dark:border-neutral-800 justify-start items-center gap-1 flex cursor-pointer shadow-sm"
                onClick={() => {
                  input!.focus();
                }}
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
                  class="text-neutral-500 dark:text-neutral-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <TextField.Input
                  ref={input!}
                  class="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-transparent outline-none ring-0 focus:ring-0 focus:out w-[500px]"
                  placeholder="Search"
                  onInput={(e) => setSearchDebounced(e.currentTarget.value)}
                />
              </TextField.Root>
            </div>
          </div>
          <div class="grow shrink basis-0 h-7 justify-start items-center gap-2.5 flex">
            <div class="px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-1 flex text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer">
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <div class="text-center text-xs font-medium">Filter</div>
            </div>
          </div>
          <div class="justify-end items-center gap-2.5 flex">
            <HoverCard.Root placement="bottom-end" openDelay={150} open={openView()} onOpenChange={setOpenView}>
              <HoverCard.Trigger>
                <div
                  class="px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-2.5 flex hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none group"
                  onClick={() => {
                    setView(view() === "grid" ? "timeline" : "grid");
                    setOpenView(true);
                  }}
                >
                  <span class="text-xs font-medium text-neutral-500 group-hover:text-neutral-600 group-hover:dark:text-neutral-400">
                    View
                  </span>
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
                    class={cn("-rotate-90", {
                      "text-black dark:text-white": view() === "grid",
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        view() === "timeline",
                    })}
                  >
                    <path d="M8 6h10" />
                    <path d="M6 12h9" />
                    <path d="M11 18h7" />
                  </svg>
                  <div class="w-[1px] h-[14px] bg-neutral-300 dark:bg-neutral-500" />
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
                    class={cn({
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        view() === "grid",
                      "text-black dark:text-white": view() === "timeline",
                    })}
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                </div>
              </HoverCard.Trigger>
              <HoverCard.Portal>
                <HoverCard.Content class="mt-1 bg-white shadow-sm dark:bg-black p-2 border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip flex flex-row gap-2">
                  <div class="flex flex-col p-2"></div>
                  <div class="flex flex-col p-2"></div>
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
            <Popover.Root placement="top-end">
              <Popover.Trigger>
                <div class="px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-1 flex text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none">
                  <div class="text-center text-xs font-medium">
                    <Switch>
                      <Match when={view() === "timeline"}>{dayjs(rangeDate().from).format("MMMM YYYY")}</Match>
                      <Match when={view() === "grid"}>Week {dayjs(rangeDate().from).format("w")}</Match>
                    </Switch>
                  </div>
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content class="mt-1 bg-white shadow-sm dark:bg-black p-2 border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip flex flex-row gap-2">
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-row gap-2 w-full items-center justify-between pb-2">
                      <div class="text-sm">Range</div>
                      <div class="flex flex-row gap-1 w-max">
                        <Popover.CloseButton>
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Popover.CloseButton>
                      </div>
                    </div>
                    <Switch>
                      <Match when={view() === "timeline"}>
                        <div class="flex flex-col gap-2">
                          <div class="px-2 py-1.5 bg-white dark:bg-black rounded shadow-sm border border-neutral-300 dark:border-neutral-800 items-center gap-1 flex select-none justify-between">
                            <button
                              class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                setRangeDate({
                                  from: dayjs(rangeDate().from).subtract(1, "year").toDate(),
                                  to: dayjs(rangeDate().to).subtract(1, "year").toDate(),
                                });
                              }}
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
                                <path d="m15 18-6-6 6-6" />
                              </svg>
                            </button>
                            <div class="text-center text-xs font-medium">{dayjs(rangeDate().from).format("YYYY")}</div>
                            <button
                              class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                setRangeDate({
                                  from: dayjs(rangeDate().from).add(1, "year").toDate(),
                                  to: dayjs(rangeDate().to).add(1, "year").toDate(),
                                });
                              }}
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
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div class="grid grid-cols-4 border border-neutral-300 dark:border-neutral-800 overflow-clip rounded">
                          <For each={monthsInYear()}>
                            {(month) => (
                              <button
                                class={cn(
                                  "flex flex-col items-center justify-center text-xs font-medium w-full cursor-pointer select-none p-2",
                                  {
                                    "bg-emerald-500 text-white dark:bg-emerald-700 border-b-0": month.isSame(
                                      dayjs(rangeDate().from),
                                      "month"
                                    ),
                                    "hover:bg-neutral-100 dark:hover:bg-neutral-950": !month.isSame(
                                      dayjs(rangeDate().from),
                                      "month"
                                    ),
                                  }
                                )}
                                onClick={() => {
                                  setRangeDate({
                                    from: month.startOf("month").toDate(),
                                    to: month.endOf("month").toDate(),
                                  });
                                }}
                              >
                                <div class="text-xs font-medium">{month.format("MMM")}</div>
                              </button>
                            )}
                          </For>
                        </div>
                      </Match>
                      <Match when={view() === "grid"}>
                        <div class="flex flex-col gap-2">
                          <div class="px-2 py-1.5 bg-white dark:bg-black rounded shadow-sm border border-neutral-300 dark:border-neutral-800 items-center gap-1 flex select-none justify-between">
                            <button
                              class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                setRangeDate({
                                  from: dayjs(rangeDate().from).subtract(1, "month").toDate(),
                                  to: dayjs(rangeDate().to).subtract(1, "month").toDate(),
                                });
                              }}
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
                                <path d="m15 18-6-6 6-6" />
                              </svg>
                            </button>
                            <div class="text-center text-xs font-medium">
                              {dayjs(rangeDate().from).format("MMMM YYYY")}
                            </div>
                            <button
                              class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                setRangeDate({
                                  from: dayjs(rangeDate().from).add(1, "month").toDate(),
                                  to: dayjs(rangeDate().to).add(1, "month").toDate(),
                                });
                              }}
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
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div class="flex flex-row gap-2">
                          <div class="flex flex-col gap-2">
                            <div class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Week</div>
                            <div class="rounded flex flex-col border border-neutral-300 dark:border-neutral-800 overflow-clip">
                              <div class="w-full flex flex-row items-center p-1 bg-neutral-200 dark:bg-neutral-900">
                                <For each={Array.from({ length: 7 })}>
                                  {(day, index) => (
                                    <div class="flex flex-col items-center justify-center w-6 h-6">
                                      <div class="text-xs font-medium">
                                        {dayjs().startOf("week").add(index(), "day").format("dd")}
                                      </div>
                                    </div>
                                  )}
                                </For>
                              </div>
                              <For each={monthWeeks(dayjs(rangeDate().from).startOf("month"))}>
                                {(week, index) => (
                                  <button
                                    class={cn(
                                      "flex flex-row items-center justify-center text-xs font-medium w-full cursor-pointer select-none p-2 border-b border-neutral-300 dark:border-neutral-800",
                                      {
                                        "border-b-0": index() === weeks().length - 1,
                                        "bg-emerald-500 text-white dark:bg-emerald-700 border-b-0": week.isSame(
                                          dayjs(rangeDate().from),
                                          "week"
                                        ),
                                        "hover:bg-neutral-100 dark:hover:bg-neutral-950": !week.isSame(
                                          dayjs(rangeDate().from),
                                          "week"
                                        ),
                                      }
                                    )}
                                    onClick={() => {
                                      setRangeDate({
                                        from: week.startOf("week").toDate(),
                                        to: week.endOf("week").toDate(),
                                      });
                                    }}
                                  >
                                    <For each={daysInWeek(week)}>
                                      {(day) => (
                                        <div class="flex flex-col items-center justify-center w-6 h-6">
                                          <div class="text-xs font-medium">{day.format("D")}</div>
                                        </div>
                                      )}
                                    </For>
                                  </button>
                                )}
                              </For>
                            </div>
                          </div>
                        </div>
                      </Match>
                    </Switch>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <div class="px-2 py-1.5 bg-emerald-500 rounded-md shadow-sm border border-emerald-600 justify-center items-center gap-1 flex cursor-pointer select-none text-white">
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <div class="text-center text-white text-xs font-medium">Add Entry</div>
            </div>
          </div>
        </div>
        <Show
          when={!calendar.isLoading && calendar.isSuccess && calendar.data}
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
                <Match when={calendar.isLoading || calendar.isFetching}>
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
          {(c) => <div class="flex flex-col"></div>}
        </Show>
      </Match>
      <Match when={auth.isLoading}>
        <div class="w-full p-2.5 bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-800 justify-center items-center gap-2.5 inline-flex">
          <div class="justify-end items-center gap-2.5 flex">
            <div class="justify-start items-center gap-2.5 flex">
              <div class="w-[500px] px-2 py-1 bg-neutral-300 dark:bg-neutral-800 rounded-md animate-pulse text-sm">
                &nbsp;
              </div>
            </div>
          </div>
          <div class="grow shrink basis-0 h-7 justify-start items-center gap-2.5 flex">
            <div class="w-20 px-2 py-1 bg-neutral-300 dark:bg-neutral-800 rounded-md animate-pulse text-sm">&nbsp;</div>
          </div>
          <div class="justify-end items-center gap-2.5 flex">
            <div class="w-24 px-2 py-1 bg-neutral-300 dark:bg-neutral-800 rounded-md animate-pulse text-sm">&nbsp;</div>
            <div class="w-16 px-2 py-1 bg-neutral-300 dark:bg-neutral-800 rounded-md animate-pulse text-sm">&nbsp;</div>
            <div class="w-24 px-2 py-1 bg-neutral-300 dark:bg-neutral-800 rounded-md animate-pulse text-sm">&nbsp;</div>
          </div>
        </div>
      </Match>
    </Switch>
  );
}
