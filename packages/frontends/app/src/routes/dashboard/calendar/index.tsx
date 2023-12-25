import { HoverCard, Popover, TextField } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { useAuth } from "../../../components/Auth";
import { CalendarUtils, daysInWeek, monthWeeks } from "../../../utils/calendar";
import { cn } from "../../../utils/cn";
import { CalendarMonth, CalendarWeek, CalendarYear } from "../../../components/calendar";
import { createStore, produce } from "solid-js/store";
import { setStretchedHeader, stretchedHeader } from "../../../components/Header";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

type CalendarOptions = {
  range: {
    from: Date;
    to: Date;
  };
  currentHovered: dayjs.Dayjs | undefined;
  view: "week" | "month" | "year";
  week: number;
  month: number;
  year: number;
};

const SearchContext = createContext<{
  search: string;
}>({
  search: "",
});

export default function CalendarPage() {
  const [auth] = useAuth();
  const [calendarOptions, setCalendarOptions] = createStore<CalendarOptions>({
    view: "month",
    range: {
      from: dayjs().startOf("month").startOf("week").toDate(),
      to: dayjs().endOf("month").endOf("week").toDate(),
    },
    currentHovered: undefined,
    month: dayjs().month(),
    week: dayjs().week(),
    year: dayjs().year(),
  });

  const [search, setSearch] = createSignal("");
  const setSearchDebounced = debounce(setSearch, 500);

  const setUrlParams = (options: CalendarOptions) => {
    const url = new URL(window.location.href);
    // remove other params too
    switch (options.view) {
      case "week":
        url.searchParams.set("view", "week");
        url.searchParams.set("week", String(options.week));
        url.searchParams.delete("month");
        url.searchParams.set("year", String(options.year));
        break;
      case "month":
        url.searchParams.set("view", "month");
        url.searchParams.delete("week");
        url.searchParams.set("month", String(options.month + 1));
        url.searchParams.set("year", String(options.year));
        break;
      case "year":
        url.searchParams.set("view", "year");
        url.searchParams.delete("week");
        url.searchParams.delete("month");
        url.searchParams.set("year", String(options.year));
        break;
    }
    window.history.pushState({}, "", url.toString());
  };

  const setTitle = (options: CalendarOptions) => {
    switch (options.view) {
      case "week":
        document.title = `Calendar - Week ${options.week} - ${dayjs(options.range.from).format("MMMM YYYY")}`;
        break;
      case "month":
        const cm = CalendarUtils.getMonthFromRange({
          from: dayjs(options.range.from),
          to: dayjs(options.range.to),
        });
        document.title = `Calendar - ${cm.format("MMMM YYYY")}`;
        break;
      case "year":
        document.title = `Calendar - Year ${dayjs(options.range.from).format("YYYY")}`;
        break;
    }
  };

  createEffect(() => {
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
    const theView = url.searchParams.get("view") as "week" | "month" | "year" | undefined;

    if (theView) {
      switch (theView) {
        case "week":
          const week = url.searchParams.get("week");
          const year = url.searchParams.get("year");
          if (!week || !year) return;
          console.log("parsing week view", week, year);
          setCalendarOptions(
            produce((draft) => {
              draft.view = theView;
              draft.range = {
                from: dayjs().week(Number(week)).year(Number(year)).startOf("week").toDate(),
                to: dayjs().week(Number(week)).year(Number(year)).endOf("week").toDate(),
              };
              draft.week = Number(week);
              draft.month = dayjs().week(Number(week)).year(Number(year)).month();
              draft.year = Number(year);
            })
          );
          break;
        case "month":
          const month2 = url.searchParams.get("month");
          const year2 = url.searchParams.get("year");
          if (!month2 || !year2) return;
          setCalendarOptions(
            produce((draft) => {
              draft.view = theView;
              draft.range = {
                from: dayjs()
                  .month(Number(month2) - 1)
                  .year(Number(year2))
                  .startOf("month")
                  .toDate(),
                to: dayjs()
                  .month(Number(month2) - 1)
                  .year(Number(year2))
                  .endOf("month")
                  .toDate(),
              };
              draft.month = Number(month2) - 1;
              draft.week = dayjs()
                .month(Number(month2) - 1)
                .year(Number(year2))
                .startOf("month")
                .startOf("week")
                .week();
              draft.year = Number(year2);
            })
          );
          break;
        case "year":
          const year3 = url.searchParams.get("year");
          if (!year3) return;
          setCalendarOptions(
            produce((draft) => {
              draft.view = theView;
              draft.range = {
                from: dayjs().year(Number(year3)).startOf("year").toDate(),
                to: dayjs().year(Number(year3)).endOf("year").toDate(),
              };
              draft.month = dayjs().year(Number(year3)).month();
              draft.week = dayjs().year(Number(year3)).startOf("year").startOf("week").week();
              draft.year = Number(year3);
            })
          );
          break;
        default:
          throw new Error("Invalid view");
      }
    }
  });

  const [openView, setOpenView] = createSignal(false);

  let input: HTMLInputElement;

  const [hoveredView, setHoveredView] = createSignal<"week" | "month" | "year" | null>(null);

  createEffect(() => {
    // update title and url params based on calendar options
    setTitle(calendarOptions);
    setUrlParams(calendarOptions);
  });

  onMount(() => {
    const oldStretched = stretchedHeader();
    setStretchedHeader(true);
    onCleanup(() => {
      setStretchedHeader(oldStretched);
    });
  });

  return (
    <SearchContext.Provider value={{ search: search() }}>
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
                  class="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-transparent outline-none ring-0 focus:ring-0 focus:out max-w-[500px] w-full "
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
                    setCalendarOptions(
                      produce((v) => {
                        v.view = v.view === "week" ? "month" : v.view === "month" ? "year" : "week";
                      })
                    );
                  }}
                >
                  {hoveredView() || calendarOptions.view}
                </button>
                <div class="justify-center items-center flex">
                  <button
                    class={cn("px-2 py-1.5", {
                      "text-black dark:text-white": calendarOptions.view === "week",
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        calendarOptions.view !== "week",
                    })}
                    onMouseOver={() => {
                      setHoveredView("week");
                    }}
                    onMouseLeave={() => {
                      setHoveredView(null);
                    }}
                    onClick={() => {
                      if (calendarOptions.view === "week") return;
                      setCalendarOptions(
                        produce((v) => {
                          v.view = "week";
                          v.week = dayjs(v.range.from).week();
                          v.month = dayjs(v.range.from).month();
                          v.year = dayjs(v.range.from).year();
                          v.range = {
                            from: dayjs(v.range.from).startOf("week").toDate(),
                            to: dayjs(v.range.from).endOf("week").toDate(),
                          };
                        })
                      );
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
                    class={cn("px-2 py-1.5", {
                      "text-black dark:text-white": calendarOptions.view === "month",
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        calendarOptions.view !== "month",
                    })}
                    onMouseOver={() => {
                      setHoveredView("month");
                    }}
                    onMouseLeave={() => {
                      setHoveredView(null);
                    }}
                    onClick={() => {
                      if (calendarOptions.view === "month") return;
                      setCalendarOptions(
                        produce((v) => {
                          v.view = "month";
                          const CM = CalendarUtils.getMonthFromRange({
                            from: dayjs(v.range.from),
                            to: dayjs(v.range.to),
                          });
                          console.log("cm", CM);
                          const calendarMonth = CalendarUtils.createCalendarMonth({
                            month: CM.month(),
                            year: v.year,
                          });
                          v.range = {
                            from: calendarMonth[0].toDate(),
                            to: calendarMonth[calendarMonth.length - 1].toDate(),
                          };
                          v.month = dayjs(v.range.from).month();
                          v.week = dayjs(v.range.from).startOf("week").week();
                          v.year = dayjs(v.range.from).year();
                        })
                      );
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
                    class={cn("px-2 py-1.5", {
                      "text-black dark:text-white": calendarOptions.view === "year",
                      "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                        calendarOptions.view !== "year",
                    })}
                    onMouseOver={() => {
                      setHoveredView("year");
                    }}
                    onMouseLeave={() => {
                      setHoveredView(null);
                    }}
                    onClick={() => {
                      if (calendarOptions.view === "year") return;
                      setCalendarOptions(
                        produce((v) => {
                          v.view = "year";
                          v.range = {
                            from: dayjs(v.range.from).startOf("year").toDate(),
                            to: dayjs(v.range.to).endOf("year").toDate(),
                          };
                          v.week = dayjs(v.range.from).week();
                          v.month = dayjs(v.range.from).month();
                          v.year = dayjs(v.range.from).year();
                        })
                      );
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
                        "text-black dark:text-white": calendarOptions.view === "year",
                        "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 group-hover:dark:text-neutral-400":
                          calendarOptions.view !== "year",
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
                        setCalendarOptions(
                          produce((v) => {
                            v.range = {
                              from: dayjs(v.range.from).startOf("year").subtract(1, "year").toDate(),
                              to: dayjs(v.range.to).endOf("year").subtract(1, "year").toDate(),
                            };
                          })
                        );
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
                      Year {dayjs(calendarOptions.range.from).format("YYYY")}
                    </div>
                    <button
                      class="text-neutral-500 hover:text-black dark:hover:text-white"
                      onClick={() => {
                        setCalendarOptions(
                          produce((v) => {
                            v.range = {
                              from: dayjs(v.range.from).startOf("year").add(1, "year").toDate(),
                              to: dayjs(v.range.to).endOf("year").add(1, "year").toDate(),
                            };
                          })
                        );
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
              <Match when={calendarOptions.view === "month" || calendarOptions.view === "week"}>
                <Popover.Root placement="top-end">
                  <Popover.Trigger
                    class={cn(
                      "px-2 py-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-300 dark:border-neutral-800 justify-center items-center gap-1 flex text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer select-none"
                    )}
                  >
                    <div class="text-center text-xs font-medium group-hover:text-black dark:group-hover:text-white ">
                      <Switch>
                        <Match when={calendarOptions.view === "month"}>
                          {dayjs().month(calendarOptions.month).year(calendarOptions.year).format("MMM YYYY")}
                        </Match>
                        <Match when={calendarOptions.view === "week"}>
                          Week {dayjs().week(calendarOptions.week).format("W")}
                        </Match>
                        <Match when={calendarOptions.view === "year"}>
                          Year {dayjs().year(calendarOptions.year).format("YYYY")}
                        </Match>
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
                          <Match when={calendarOptions.view === "month"}>
                            <div class="flex flex-col gap-2">
                              <div class="px-2 py-1.5 bg-white dark:bg-black rounded shadow-sm border border-neutral-300 dark:border-neutral-800 items-center gap-1 flex select-none justify-between">
                                <button
                                  class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                                  onClick={() => {
                                    setCalendarOptions(
                                      produce((v) => {
                                        v.range = {
                                          from: dayjs(v.range.from).startOf("month").subtract(1, "month").toDate(),
                                          to: dayjs(v.range.to).endOf("month").subtract(1, "month").toDate(),
                                        };
                                      })
                                    );
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
                                  {dayjs().month(calendarOptions.month).year(calendarOptions.year).format("MMMM YYYY")}
                                </div>
                                <button
                                  class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                                  onClick={() => {
                                    setCalendarOptions(
                                      produce((v) => {
                                        v.range = {
                                          from: dayjs(v.range.from).startOf("month").add(1, "month").toDate(),
                                          to: dayjs(v.range.to).endOf("month").add(1, "month").toDate(),
                                        };
                                      })
                                    );
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
                              <For
                                each={CalendarUtils.getMonthsInYear(
                                  dayjs().month(calendarOptions.month).year(calendarOptions.year).startOf("year")
                                )}
                              >
                                {(month) => (
                                  <button
                                    class={cn(
                                      "flex flex-col items-center justify-center text-xs font-medium w-full cursor-pointer select-none p-2",
                                      {
                                        "bg-emerald-500 text-white dark:bg-emerald-700 border-b-0":
                                          calendarOptions.month === month.month() &&
                                          calendarOptions.year === month.year(),
                                        "hover:bg-neutral-100 dark:hover:bg-neutral-950": !(
                                          calendarOptions.month === month.month() &&
                                          calendarOptions.year === month.year()
                                        ),
                                      }
                                    )}
                                    onClick={() => {
                                      const mooo = CalendarUtils.createCalendarMonth({
                                        month: month.month(),
                                        year: month.year(),
                                      });
                                      setCalendarOptions(
                                        produce((v) => {
                                          v.range = {
                                            from: mooo[0].toDate(),
                                            to: mooo[mooo.length - 1].toDate(),
                                          };
                                          v.week = month.startOf("week").week();
                                          v.month = month.month();
                                          v.year = month.year();
                                        })
                                      );
                                    }}
                                  >
                                    <div class="text-xs font-medium">{month.format("MMM")}</div>
                                  </button>
                                )}
                              </For>
                            </div>
                          </Match>
                          <Match when={calendarOptions.view === "week"}>
                            <div class="flex flex-col gap-2">
                              <div class="px-2 py-1.5 bg-white dark:bg-black rounded shadow-sm border border-neutral-300 dark:border-neutral-800 items-center gap-1 flex select-none justify-between">
                                <button
                                  class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                                  onClick={() => {
                                    setCalendarOptions(
                                      produce((v) => {
                                        v.range = {
                                          from: dayjs(v.range.from).startOf("week").subtract(1, "week").toDate(),
                                          to: dayjs(v.range.from).endOf("week").subtract(1, "week").toDate(),
                                        };
                                        v.week = dayjs(v.range.from).week();
                                        v.month = CalendarUtils.getMonthFromRange({
                                          from: dayjs(v.range.from),
                                          to: dayjs(v.range.to),
                                        }).month();
                                        v.year = dayjs(v.range.from).year();
                                      })
                                    );
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
                                  Week {dayjs().week(calendarOptions.week).format("W - YYYY")}
                                </div>
                                <button
                                  class="p-0.5 text-neutral-500 hover:text-black dark:hover:text-white"
                                  onClick={() => {
                                    setCalendarOptions(
                                      produce((v) => {
                                        v.range = {
                                          from: dayjs(v.range.from).startOf("week").add(1, "week").toDate(),
                                          to: dayjs(v.range.from).endOf("week").add(1, "week").toDate(),
                                        };
                                        v.week = dayjs(v.range.from).week();
                                        v.month = CalendarUtils.getMonthFromRange({
                                          from: dayjs(v.range.from),
                                          to: dayjs(v.range.to),
                                        }).month();
                                        v.year = dayjs(v.range.from).year();
                                      })
                                    );
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
                                  <For
                                    each={CalendarUtils.monthWeeks(
                                      dayjs().month(calendarOptions.month).year(calendarOptions.year)
                                    )}
                                  >
                                    {(week, index) => (
                                      <button
                                        class={cn(
                                          "flex flex-row items-center justify-center text-xs font-medium w-full cursor-pointer select-none p-2 border-b border-neutral-300 dark:border-neutral-800",
                                          {
                                            "border-b-0":
                                              index() ===
                                              CalendarUtils.monthWeeks(
                                                dayjs().week(calendarOptions.week).startOf("week")
                                              ).length -
                                                1,
                                            "bg-emerald-500 text-white dark:bg-emerald-700 border-b-0": week.isSame(
                                              dayjs(calendarOptions.range.from),
                                              "week"
                                            ),
                                            "hover:bg-neutral-100 dark:hover:bg-neutral-950": !week.isSame(
                                              dayjs(calendarOptions.range.from),
                                              "week"
                                            ),
                                          }
                                        )}
                                        onClick={() => {
                                          setCalendarOptions(
                                            produce((v) => {
                                              v.range = {
                                                from: week.startOf("week").toDate(),
                                                to: week.endOf("week").toDate(),
                                              };
                                              v.week = week.week();
                                              v.month = week.month();
                                              v.year = week.year();
                                            })
                                          );
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
        <div class="flex flex-col w-full h-full overflow-clip">
          <Suspense
            fallback={
              <div class="flex flex-col w-full h-full">
                <Switch>
                  <Match when={calendarOptions.view === "week"}>
                    <div class="grid grid-cols-7 grid-rows-6 w-full h-full">
                      <div class="flex flex-col gap-4"></div>
                    </div>
                  </Match>
                  <Match when={calendarOptions.view === "month"}>
                    <div
                      class={cn("grid grid-cols-7 grid-rows-5 w-full h-full", {
                        "grid-rows-6":
                          CalendarUtils.createCalendarMonth({
                            month: calendarOptions.month,
                            year: calendarOptions.year,
                          }).length === 42,
                      })}
                    >
                      <For
                        each={CalendarUtils.createCalendarMonth({
                          month: calendarOptions.month,
                          year: calendarOptions.year,
                        })}
                      >
                        {(days, index) => <div class="w-full h-full bg-neutral-100 dark:bg-neutral-950"></div>}
                      </For>
                    </div>
                  </Match>
                </Switch>
              </div>
            }
          >
            <Switch>
              <Match when={calendarOptions.view === "month"}>
                <CalendarMonth
                  month={() => calendarOptions.month}
                  year={() => calendarOptions.year}
                  range={() => ({
                    from: calendarOptions.range.from,
                    to: calendarOptions.range.to,
                  })}
                />
              </Match>
              <Match when={calendarOptions.view === "week"}>
                <CalendarWeek
                  week={() => calendarOptions.week}
                  year={() => calendarOptions.year}
                  range={() => ({
                    from: calendarOptions.range.from,
                    to: calendarOptions.range.to,
                  })}
                />
              </Match>
              <Match when={calendarOptions.view === "year"}>
                <CalendarYear
                  year={() => calendarOptions.year}
                  range={() => ({
                    from: calendarOptions.range.from,
                    to: calendarOptions.range.to,
                  })}
                />
              </Match>
            </Switch>
          </Suspense>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
