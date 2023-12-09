import { HoverCard, Popover, TextField } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { For, Match, Show, Suspense, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { useAuth } from "../../../components/Auth";
import { CalendarUtils, daysInWeek, monthWeeks } from "../../../utils/calendar";
import { cn } from "../../../utils/cn";
import { Calendar as CalendarComp } from "../../../components/calendar";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

export default function Calendar() {
  const [auth] = useAuth();
  const [rangeDate, setRangeDate] = createSignal({
    from: dayjs().startOf("month").toDate(),
    to: dayjs().endOf("month").toDate(),
  });
  const [search, setSearch] = createSignal("");
  const setSearchDebounced = debounce(setSearch, 500);

  const [view, setView] = createSignal<"week" | "month" | "year">("month");

  createEffect(() => {
    document.title = `Calendar: ${dayjs(rangeDate().from).format("Do MMM")} - ${dayjs(rangeDate().to).format(
      "Do MMM YYYY"
    )}`;

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
  createEffect(() => {
    // take the url params and update the range
    const url = new URL(window.location.href);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (from && to) {
      setRangeDate({
        from: dayjs(from).toDate(),
        to: dayjs(to).toDate(),
      });
    }
  });
  createEffect(() => {
    // update the url with the new range
    const url = new URL(window.location.href);
    url.searchParams.set("from", dayjs(rangeDate().from).format("YYYY-MM-DD"));
    url.searchParams.set("to", dayjs(rangeDate().to).format("YYYY-MM-DD"));
    window.history.pushState({}, "", url.toString());
  });

  const [openView, setOpenView] = createSignal(false);

  let input: HTMLInputElement;

  const weeks = () => CalendarUtils.monthWeeks(dayjs(rangeDate().from).startOf("month"));
  const monthsInYear = () => CalendarUtils.getMonthsInYear(dayjs(rangeDate().from).startOf("year"));
  const daysInMonth = () => CalendarUtils.getDaysInMonth(dayjs(rangeDate().from).startOf("month"));
  const fillFirstWeekOfTheMonth = () => CalendarUtils.getFillDaysForFirstWeek(dayjs(rangeDate().from).startOf("month"));
  const fillLastWeekOfTheMonth = () => CalendarUtils.getFillDaysForLastWeek(dayjs(rangeDate().from).endOf("month"));

  const [hoveredView, setHoveredView] = createSignal<"week" | "month" | "year" | null>(null);

  return (
    <div class="flex flex-col w-full h-full">
      <div class="w-full p-2.5 bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-800 justify-center items-center gap-2.5 inline-flex">
        <div class="justify-end items-center gap-2.5 flex">
          <div class="justify-start items-center gap-2.5 flex">
            <TextField.Root
              class="px-2 py-1.5 bg-white dark:bg-black rounded-md border border-neutral-300 dark:border-neutral-800 justify-start items-center gap-1 flex cursor-pointer shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700"
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
          <button class="px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-1 flex text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer">
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
          </button>
        </div>
        <div class="justify-end items-center gap-2.5 flex">
          <button
            class={cn(
              "px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-2.5 flex hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none text-neutral-500 hover:text-black dark:hover:text-white"
            )}
          >
            <span class="text-xs">Share</span>
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
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
          </button>
          <HoverCard.Root placement="bottom-end" openDelay={150} open={openView()} onOpenChange={setOpenView}>
            <HoverCard.Trigger
              class={cn(
                "bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center flex hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none overflow-clip"
              )}
            >
              <button
                class="text-xs font-medium text-neutral-500 group-hover:text-black group-hover:dark:text-white px-2 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 capitalize hover:text-black dark:text-white"
                onClick={() => {
                  setView((v) => (v === "week" ? "month" : v === "month" ? "year" : "week"));
                }}
              >
                {hoveredView() || view()}
              </button>
              <div class="px-2 py-1.5 justify-center items-center gap-2.5 flex">
                <button
                  class={cn({
                    "text-black dark:text-white": view() === "week",
                    "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                      view() === "month" || view() === "year",
                  })}
                  onMouseOver={() => {
                    setHoveredView("week");
                  }}
                  onMouseLeave={() => {
                    setHoveredView(null);
                  }}
                  onClick={() => {
                    setView("week");
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
                    class="-rotate-90"
                  >
                    <path d="M8 6h10" />
                    <path d="M6 12h9" />
                    <path d="M11 18h7" />
                  </svg>
                </button>
                <div class="w-[1px] h-[14px] bg-neutral-300 dark:bg-neutral-500" />
                <button
                  class={cn({
                    "text-black dark:text-white": view() === "month",
                    "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                      view() === "week" || view() === "year",
                  })}
                  onMouseOver={() => {
                    setHoveredView("month");
                  }}
                  onMouseLeave={() => {
                    setHoveredView(null);
                  }}
                  onClick={() => {
                    setView("month");
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
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M17 14h-6" />
                    <path d="M13 18H7" />
                    <path d="M7 14h.01" />
                    <path d="M17 18h.01" />
                  </svg>
                </button>
                <div class="w-[1px] h-[14px] bg-neutral-300 dark:bg-neutral-500" />
                <button
                  class={cn({
                    "text-black dark:text-white": view() === "year",
                    "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                      view() === "month" || view() === "week",
                  })}
                  onMouseOver={() => {
                    setHoveredView("year");
                  }}
                  onMouseLeave={() => {
                    setHoveredView(null);
                  }}
                  onClick={() => {
                    setView("year");
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
                    class={cn({
                      "text-black dark:text-white": view() === "year",
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        view() === "month" || view() === "week",
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
                </button>
              </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content class="mt-1 bg-white shadow-sm dark:bg-black p-2 border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip flex flex-row gap-2">
                <div class="flex flex-col p-2"></div>
                <div class="flex flex-col p-2"></div>
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
          <Switch
            fallback={
              <div class="flex flex-col gap-2">
                <div class="px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 items-center gap-2 flex select-none justify-between">
                  <button
                    class="text-neutral-500 hover:text-black dark:hover:text-white"
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
                  <div class="text-center text-xs font-medium">Year {dayjs(rangeDate().from).format("YYYY")}</div>
                  <button
                    class="text-neutral-500 hover:text-black dark:hover:text-white"
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
            }
          >
            <Match when={view() === "month" || view() === "week"}>
              <Popover.Root placement="top-end">
                <Popover.Trigger
                  class={cn(
                    "px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-1 flex text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none"
                  )}
                >
                  <div class="text-center text-xs font-medium group-hover:text-black dark:group-hover:text-white ">
                    <Switch>
                      <Match when={view() === "month"}>{dayjs(rangeDate().from).format("MMMM YYYY")}</Match>
                      <Match when={view() === "week"}>Week {dayjs(rangeDate().from).format("w")}</Match>
                      <Match when={view() === "year"}>Year {dayjs(rangeDate().from).format("YYYY")}</Match>
                    </Switch>
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
                        <Match when={view() === "month"}>
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
                              <div class="text-center text-xs font-medium">
                                {dayjs(rangeDate().from).format("YYYY")}
                              </div>
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
                        <Match when={view() === "week"}>
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
            </Match>
          </Switch>
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
      <Suspense
        fallback={
          <div class="flex flex-col w-full h-full">
            <Switch>
              <Match when={view() === "week"}>
                <div class="grid grid-cols-7 grid-rows-6 w-full h-full">
                  <div class="flex flex-col gap-4"></div>
                </div>
              </Match>
              <Match when={view() === "month"}>
                <div
                  class={cn("grid grid-cols-7 grid-rows-5 w-full h-full", {
                    "grid-rows-6":
                      fillFirstWeekOfTheMonth().length + daysInMonth().length + fillLastWeekOfTheMonth().length === 42,
                  })}
                >
                  <For each={fillFirstWeekOfTheMonth()}>
                    {(days, index) => <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950"></div>}
                  </For>
                  <For each={daysInMonth()}>
                    {(days, index) => <div class="w-full h-full bg-neutral-200 dark:bg-neutral-900"></div>}
                  </For>
                  <For each={fillLastWeekOfTheMonth()}>
                    {(days, index) => <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950"></div>}
                  </For>
                </div>
              </Match>
            </Switch>
          </div>
        }
      >
        <CalendarComp
          calendar={{
            daysInMonth,
            fillFirstWeekOfTheMonth,
            fillLastWeekOfTheMonth,
            monthsInYear,
            weeks,
          }}
          filter={{
            search,
          }}
          range={rangeDate}
          view={view}
        ></CalendarComp>
      </Suspense>
    </div>
  );
}
