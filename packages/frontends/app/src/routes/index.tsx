import { A } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Colors,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { Line } from "solid-chartjs";
import { For, JSX, Match, Show, Suspense, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import Markdown from "solid-marked/component";
import { Transition, TransitionGroup } from "solid-transition-group";
import { useAuth } from "../components/Auth";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import { fixedBottom, setFixedBottom, setStretchedBottom, stretchedBottom } from "../components/Bottom";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

type StatValue = number | string | Array<string> | Array<number>;

interface Stat {
  id: string;
  label: (value: this["value"]) => string;
  description: (date: Date, difference: this["difference"]) => string;
  value: StatValue;
  date: Date;
  difference: this["value"];
  chart?: {
    type: "line";
    data: {
      labels: Array<string>;
      datasets: ChartData["datasets"];
    };
    options: ChartOptions;
  };
}

const statValueToNumber = (value: StatValue): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (isNaN(parsed)) return undefined;
    return parsed;
  }
  return undefined;
};

const statValueDescriptionPrefix = (value: StatValue): string => {
  const v = statValueToNumber(value);
  if (!v) return "";
  return `${v > 0 ? "+" : v < 0 ? "" : ""}`;
};

const stats: Array<Stat> = [
  {
    id: "1",
    label: (value) => `${value} drives`,
    description: (date, difference) =>
      `${statValueDescriptionPrefix(difference)}${difference} drives since ${dayjs(date).fromNow(true)}`,
    date: dayjs().subtract(1, "week").toDate(),
    value: 20, // 20 drives
    difference: 20 - 10, // 10 drives last week
    chart: {
      type: "line",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context: any) {
                let label = "";
                if (context.parsed.y !== null) {
                  label += context.parsed.y + " drives";
                }
                return label;
              },
            },
          },
        },
      },
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
          {
            label: "Drives",
            data: [2, 4, 5, 3, 7, 6, 8],
            fill: false,
            borderColor: "#10B981",
            cubicInterpolationMode: "monotone",
            tension: 0.4,
          },
        ],
      },
    },
  },
  {
    id: "2",
    label: (value) => `${value} distance`,
    description: (date, difference) =>
      `${statValueDescriptionPrefix(difference)}${difference} km since ${dayjs(date).fromNow(true)}`,
    date: dayjs().subtract(1, "week").toDate(),
    value: 20 * 12, // 12 km per drive, 20 drives
    difference: 20 * 12 - 10 * 12, // 10 km per drive, 10 drives
    chart: {
      type: "line",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context: any) {
                let label = "";
                if (context.parsed.y !== null) {
                  label += context.parsed.y + " km";
                }
                return label;
              },
            },
          },
        },
      },
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
          {
            label: "Distance",
            data: [2, 4, 5, 3, 7, 6, 8],
            fill: false,
            borderColor: "#10B981",
            cubicInterpolationMode: "monotone",
            tension: 0.4,
          },
        ],
      },
    },
  },
  {
    id: "3",
    label: (value) => `${value} CHF revenue`,
    description: (date, difference) =>
      `${statValueDescriptionPrefix(difference)}${difference} CHF revenue since ${dayjs(date).fromNow(true)}`,
    date: dayjs().subtract(1, "week").toDate(),
    value: 6.8 * 20 + 3.4 * (20 * 12) + 20 * 0.25, // base: 6.8, per km: 3.4, per minute: 0.25
    difference: 6.8 * 10 + 3.4 * (10 * 12) + 10 * 0.25, // base: 6.8, per km: 3.4, per minute: 0.25
  },
  {
    id: "4",
    label: (value) => `${value} min. driven`,
    description: (date, difference) =>
      `${statValueDescriptionPrefix(difference)}${difference} min. driven since ${dayjs(date).fromNow(true)}`,
    date: dayjs().subtract(1, "week").toDate(),
    value: 20 * 15, // 15 minutes * 20 drives
    difference: -10 * 15, // 15 minutes * 10 drives
  },
];

const calendarEntries: Array<{
  id: string;
  date: Date;
  entries: number;
  revenue: number;
}> = [
  {
    id: "1",
    date: dayjs().subtract(3, "day").startOf("day").toDate(),
    entries: 40,
    revenue: 40 * 6.8 + 40 * 3.4 * 12 + 40 * 0.25,
  },
  {
    id: "2",
    date: dayjs().subtract(2, "day").startOf("day").toDate(),
    entries: 14,
    revenue: 14 * 6.8 + 14 * 3.4 * 12 + 14 * 0.25,
  },
  {
    id: "3",
    date: dayjs().subtract(1, "day").startOf("day").toDate(),
    entries: 8,
    revenue: 8 * 6.8 + 8 * 3.4 * 12 + 8 * 0.25,
  },
  {
    id: "4",
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
      return Queries.Users.Company.get(token);
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    // refetchInterval: 1000 * 5,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  }));
  let myChart: HTMLCanvasElement;
  onMount(() => {
    Chart.register(Colors, LineController, CategoryScale, PointElement, LineElement, LinearScale, Tooltip);
  });

  createEffect(() => {
    // if a stat is selected activate keyboard selection, and focus the the stat
    const stat = selectedStat();
    const handler = (e: KeyboardEvent) => {
      const stat2 = selectedStat();
      if (!stat2) return;
      if (e.key === "ArrowLeft") {
        const index = stats.indexOf(stat2);
        if (index === 0) return;
        setSelectedStat(stats[index - 1]);
        const el = document.getElementById(`stat-${stats[index - 1].id}`);
        if (!el) return;
        el.focus();
      }
      if (e.key === "ArrowRight") {
        const index = stats.indexOf(stat2);
        if (index === stats.length - 1) return;
        setSelectedStat(stats[index + 1]);
        const el = document.getElementById(`stat-${stats[index + 1].id}`);
        if (!el) return;
        el.focus();
      }
    };
    if (!stat) {
      window.removeEventListener("keydown", handler);
      return;
    }
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  createEffect(() => {
    // set the title of the page

    if (!company.isSuccess) return;
    if (!company.data) {
      document.title = `Dashboard - Not found`;
      return;
    }
    if (!company.data.name) {
      document.title = `Dashboard - ${company.data.id}`;
      return;
    }
    document.title = `Dashboard - ${company.data.name}`;
  });

  createEffect(() => {
    // if pressed on ESC, deselect the selected stat
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStat(null);
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  const [selectedStat, setSelectedStat] = createSignal<Stat | null>(null);

  const notices = createQuery(() => ({
    queryKey: ["notices"],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.Notices.get(token);
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
    // refetchInterval: 1000 * 5,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  }));

  const dismissNotice = createMutation(() => ({
    mutationFn: (id: string) => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Mutations.Notices.dismiss(token, id);
    },
  }));

  const dismissAllNotices = createMutation(() => ({
    mutationFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Mutations.Notices.dismissAll(token);
    },
  }));

  const [noticeIndex, setNoticeIndex] = createSignal(0);

  onMount(() => {
    const oldFixedBottom = fixedBottom();
    const oldStretchedBottom = stretchedBottom();
    setFixedBottom(true);
    setStretchedBottom(false);
    onCleanup(() => {
      setFixedBottom(oldFixedBottom);
      setStretchedBottom(oldStretchedBottom);
    });
  });

  return (
    <div class="flex flex-col container mx-auto h-full pb-[200px]">
      <Suspense
        fallback={
          <div class="flex flex-row gap-2 items-center justify-center text-neutral-500 w-full h-full">
            <div>
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
            <div>Loading Dashboard</div>
          </div>
        }
      >
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
          <Match
            when={!auth.isLoading && auth.isAuthenticated && !company.isPending && company.isSuccess && company.data}
          >
            {(c) => (
              <div class="flex flex-col gap-8 py-8 md:px-0 px-4">
                <div class="text-2xl font-bold">Welcome back, {auth.user?.name}</div>
                <TransitionGroup name="slide-fade">
                  <Show when={notices.isSuccess && notices.data && notices.data}>
                    {(theNotices) => (
                      <div class="flex flex-col gap-4">
                        <div class="flex flex-row gap-4 items-center justify-between">
                          <span class="text-xl font-bold ">Notices</span>
                          <div class="flex flex-row gap-2 items-center">
                            <div class="flex flex-row items-center rounded-md border border-neutral-300 dark:border-neutral-800 overflow-clip">
                              <button
                                disabled={noticeIndex() === 0}
                                class="flex flex-row gap-2 items-center hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  setNoticeIndex((n) => {
                                    if (n === 0) return theNotices().length - 1;
                                    return n - 1;
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
                              <button
                                disabled={noticeIndex() === theNotices().length - 1}
                                class="flex flex-row gap-2 items-center hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  setNoticeIndex((n) => {
                                    if (n === theNotices().length - 1) return 0;
                                    return n + 1;
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
                            <button
                              class="flex flex-row gap-2 items-center rounded-md border border-transparent hover:border-neutral-300 dark:hover:border-neutral-800 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-400 dark:text-neutral-500"
                              onClick={async () => {
                                await dismissAllNotices.mutateAsync();
                              }}
                            >
                              <span class="text-xs font-medium ">Dismiss All</span>
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
                                class="lucide lucide-x"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <Transition name="slide-fade">
                          <Switch>
                            <Match when={!theNotices()[noticeIndex()].dismissed && theNotices()[noticeIndex()]}>
                              {(notice) => (
                                <div class="flex flex-col gap-2">
                                  <div
                                    class={cn(
                                      "flex flex-col gap-6 w-full rounded-md bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 p-4",
                                      {
                                        "bg-red-600 text-white dark:bg-red-700 border-transparent dark:border-transparent":
                                          notice().type === "error",
                                        "bg-yellow-400 dark:bg-yellow-700 border-transparent dark:border-transparent":
                                          notice().type === "warning",
                                      }
                                    )}
                                  >
                                    <div class="flex flex-row items-center justify-between">
                                      <div>
                                        <span
                                          class={cn("text-md font-bold", {
                                            "text-white": notice().type === "error",
                                          })}
                                        >
                                          {notice().title}
                                        </span>
                                      </div>
                                      <div class="flex flex-row items-center gap-2">
                                        <button
                                          class={cn(
                                            "flex flex-row gap-2 items-center rounded-md border border-transparent hover:border-neutral-300 dark:hover:border-neutral-800 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-400 dark:text-neutral-500",
                                            {
                                              "text-white dark:text-white hover:text-white hover:bg-red-900 dark:hover:bg-red-950 hover:border-transparent dark:hover:border-transparent":
                                                notice().type === "error",
                                              "text-black dark:text-white hover:text-white hover:bg-yellow-900 dark:hover:bg-yellow-950 hover:border-transparent dark:hover:border-transparent":
                                                notice().type === "warning",
                                            }
                                          )}
                                          onClick={async () => {
                                            await dismissNotice.mutateAsync(notice().id);
                                          }}
                                        >
                                          <span class="text-xs font-medium ">Dismiss</span>
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
                                            class="lucide lucide-x"
                                          >
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    <Markdown
                                      builtins={{
                                        Strong(props): JSX.Element {
                                          return <strong class="font-bold">{props.children}</strong>;
                                        },
                                        Heading(props): JSX.Element {
                                          return (
                                            <Dynamic
                                              component={`h${props.depth}`}
                                              class={cn("font-bold", {
                                                "text-xl": props.depth === 1,
                                                "text-lg": props.depth === 2,
                                                "text-md": props.depth === 3,
                                                "text-sm": props.depth === 4,
                                                "text-xs": props.depth === 5,
                                              })}
                                              id={props.id}
                                            >
                                              {props.children}
                                            </Dynamic>
                                          );
                                        },
                                        Paragraph(props): JSX.Element {
                                          return <p class="">{props.children}</p>;
                                        },
                                        Root(props): JSX.Element {
                                          return <div class="flex flex-col gap-6">{props.children}</div>;
                                        },
                                        Break(): JSX.Element {
                                          return <br />;
                                        },
                                        ThematicBreak(): JSX.Element {
                                          return <div class="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 my-4" />;
                                        },
                                        Blockquote(props): JSX.Element {
                                          return <blockquote>{props.children}</blockquote>;
                                        },
                                        Image(props): JSX.Element {
                                          return <img src={props.url} alt={props.alt ?? props.title ?? undefined} />;
                                        },
                                        Code(props): JSX.Element {
                                          return (
                                            <code class="flex flex-col p-2 bg-black dark:bg-white rounded-md text-white dark:text-black leading-none">
                                              {props.children}
                                            </code>
                                          );
                                        },
                                        InlineCode(props): JSX.Element {
                                          return (
                                            <code class="flex flex-col p-1 px-2 text-sm w-max bg-black dark:bg-white rounded-md text-white dark:text-black leading-none">
                                              {props.children}
                                            </code>
                                          );
                                        },
                                        Emphasis(props): JSX.Element {
                                          return <em>{props.children}</em>;
                                        },
                                        List(props): JSX.Element {
                                          return (
                                            <Dynamic
                                              component={props.ordered ? "ol" : "ul"}
                                              start={props.start ?? undefined}
                                              class="inline-flex flex-col flex-wrap gap-0.5"
                                            >
                                              {props.children}
                                            </Dynamic>
                                          );
                                        },
                                        ListItem(props): JSX.Element {
                                          return (
                                            <li class="inline-flex flex-row flex-wrap gap-2">
                                              <Show when={props.checked != null} fallback={props.children}>
                                                <input type="checkbox" checked={props.checked ?? undefined} />
                                                {props.children}
                                              </Show>
                                            </li>
                                          );
                                        },
                                        Link(props): JSX.Element {
                                          return (
                                            <A
                                              href={props.url}
                                              target={
                                                ["./", "/"].some((x) => props.url.startsWith(x)) ? undefined : "_blank"
                                              }
                                              title={props.title ?? undefined}
                                              class="text-blue-700 dark:text-blue-500 hover:underline"
                                            >
                                              {props.children}
                                            </A>
                                          );
                                        },
                                      }}
                                    >
                                      {notice().content}
                                    </Markdown>
                                    <span
                                      class={cn("text-xs text-neutral-400 dark:text-neutral-600", {
                                        "text-white dark:text-white": notice().type === "error",
                                        "text-black dark:text-white": notice().type === "warning",
                                      })}
                                    >
                                      Added by {notice().author.name} {dayjs(notice().createdAt).fromNow()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Match>
                          </Switch>
                        </Transition>
                      </div>
                    )}
                  </Show>
                </TransitionGroup>
                <div class="flex flex-col gap-4">
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
                    <div class="grid md:grid-cols-4 grid-cols-1 gap-2">
                      <For each={stats}>
                        {(stat) => (
                          <button
                            class={cn(
                              "w-full p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex-row justify-between items-start inline-flex rounded-md gap-2 select-none shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-950",
                              {
                                "border-emerald-500 dark:border-emerald-500": selectedStat() === stat,
                              }
                            )}
                            onClick={() => {
                              setSelectedStat((s) => (s === stat ? null : stat));
                            }}
                          >
                            <div class="flex flex-col h-full">
                              <div class="flex flex-row gap-2 items-center">
                                <Switch>
                                  <Match
                                    when={statValueToNumber(stat.difference) && statValueToNumber(stat.difference)! > 0}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                  <Match
                                    when={
                                      statValueToNumber(stat.difference) && statValueToNumber(stat.difference)! === 0
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                  <Match
                                    when={statValueToNumber(stat.difference) && statValueToNumber(stat.difference)! < 0}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                </Switch>
                                <span class="text-xs font-medium">{stat.label(stat.value)}</span>
                              </div>
                              <div class="flex flex-1"></div>
                              <div class="flex flex-row gap-2 items-center">
                                <span class="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                  {stat.description(stat.date, stat.difference)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div class="flex flex-col relative w-16 h-16 rounded-full overflow-clip bg-transparent border-[6px] border-emerald-500 items-center justify-center text-emerald-500 gap-0.5">
                                <span class="text-md font-bold">{stat.value}</span>
                              </div>
                            </div>
                          </button>
                        )}
                      </For>
                    </div>
                    <Transition name="slide-fade" appear={false}>
                      <Show when={selectedStat() !== null && selectedStat()}>
                        {(stat) => (
                          <div class="w-full flex flex-col gap-4 p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-md select-none shadow-sm">
                            <div class="w-full flex flex-row items-center justify-between">
                              <div class="w-full flex flex-row gap-2 items-center">
                                <Switch>
                                  <Match
                                    when={
                                      statValueToNumber(stat().difference) && statValueToNumber(stat().difference)! > 0
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                  <Match
                                    when={
                                      statValueToNumber(stat().difference) &&
                                      statValueToNumber(stat().difference)! === 0
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                  <Match
                                    when={
                                      statValueToNumber(stat().difference) && statValueToNumber(stat().difference)! < 0
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                      <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                  </Match>
                                </Switch>
                                <span class="text-xs font-medium">{stat().label(stat().value)}</span>
                              </div>
                              <div>
                                <button
                                  id={`stat-${stat().id}`}
                                  class="flex flex-row gap-2 items-center rounded-md border border-transparent hover:border-neutral-300 dark:hover:border-neutral-800 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-400 dark:text-neutral-500"
                                  onClick={() => setSelectedStat(null)}
                                >
                                  <span class="text-xs font-medium ">Close</span>
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
                                    class="lucide lucide-x"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div class="w-full md:h-[300px] overflow-clip h-[20svh] flex flex-col items-center justify-center gap-4">
                              <Transition name="slide-fade">
                                <Switch>
                                  <Match when={stat().chart && stat().chart}>
                                    {(chart) => (
                                      <Switch
                                        fallback={
                                          <div class="w-full h-auto flex flex-col items-center justify-center gap-4">
                                            <div class="flex flex-row gap-2 items-center">
                                              <span class="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                                There is currently no view for this chart: {chart().type}
                                              </span>
                                            </div>
                                          </div>
                                        }
                                      >
                                        <Match when={chart().type === "line"}>
                                          <Line ref={myChart!} data={chart().data} options={chart().options} />
                                        </Match>
                                      </Switch>
                                    )}
                                  </Match>
                                  <Match when={!stat().chart}>
                                    <div class="w-full h-auto flex flex-col items-center justify-center gap-4">
                                      <div class="flex flex-row gap-2 items-center">
                                        <span class="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                          No chart data available
                                        </span>
                                      </div>
                                    </div>
                                  </Match>
                                </Switch>
                              </Transition>
                            </div>
                          </div>
                        )}
                      </Show>
                    </Transition>
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
                        <A
                          href={`./calendar/entry/${entry.id}`}
                          class="w-full p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex-col justify-start items-start inline-flex rounded-md gap-2 select-none shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
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
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            )}
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
      </Suspense>
    </div>
  );
}
