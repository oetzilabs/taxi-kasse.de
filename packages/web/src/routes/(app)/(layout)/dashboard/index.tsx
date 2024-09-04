import type { CurrencyCode } from "@/lib/api/application";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { LucideProps } from "lucide-solid";
import AddRideModal from "@/components/forms/AddRide";
import { language } from "@/components/stores/Language";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLanguage } from "@/lib/api/application";
import { getHotspot } from "@/lib/api/orders";
import { getRides } from "@/lib/api/rides";
import { getStatistics } from "@/lib/api/statistics";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { createScrollPosition } from "@solid-primitives/scroll";
import { A, createAsync, revalidate, RouteDefinition, useSearchParams } from "@solidjs/router";
import { getSystemNotifications } from "~/lib/api/system_notifications";
import dayjs from "dayjs";
import Box from "lucide-solid/icons/box";
import Car from "lucide-solid/icons/car";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import SquareArrowOutUpRight from "lucide-solid/icons/square-arrow-out-up-right";
import TrendingUp from "lucide-solid/icons/trending-up";
import { createEffect, createSignal, For, JSX, Show, Suspense } from "solid-js";
import { TextField, TextFieldRoot } from "../../../../components/ui/textfield";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const rides = await getRides();
    const stats = await getStatistics();
    const hotspot = await getHotspot();
    return { notification, rides, session, stats, hotspot };
  },
} satisfies RouteDefinition;

const icons: Record<string, (props: LucideProps) => JSX.Element> = {
  rides: Car,
  earnings: DollarSign,
  orders: ShoppingBag,
  performance: TrendingUp,
};

const nonEmptyObject = (obj: Record<string, unknown>) => Object.keys(obj).length > 0;

const Statistic = (props: {
  label: string;
  value: number;
  prefix: string;
  sufix: string;
  type: "currency" | "number";
  currency: CurrencyCode;
  icon?: (props: LucideProps) => JSX.Element;
  index: number;
  priority: number;
  description: string;
}) => (
  <div
    class={cn(
      "flex flex-col  w-full gap-0 select-none border-t lg:border-l lg:border-t-0 first:border-l-0 first:border-t-0 border-neutral-200 dark:border-neutral-800 relative overflow-clip group",
    )}
  >
    <div class="flex flex-row items-center justify-between gap-4 px-6 pb-4 pt-6">
      <Show when={props.icon !== undefined && props.icon} fallback={<Box />} keyed>
        {(Ic) => <Ic class="size-4 text-muted-foreground" />}
      </Show>
      <span class="font-bold uppercase text-xs text-muted-foreground">{props.label}</span>
    </div>
    <div class="flex flex-row items-center justify-between gap-4 px-6 py-4">
      <div class=""></div>
      <div class="text-3xl font-bold flex flex-row items-baseline gap-2">
        <Show when={props.prefix.length > 0}>
          <span>{props.prefix}</span>
        </Show>
        <span>
          {props.type === "currency"
            ? new Intl.NumberFormat(language() ?? "en-US", {
                style: "currency",
                currency: props.currency,
              })
                .formatToParts(Number(props.value))
                .filter((p) => p.type !== "currency" && p.type !== "literal")
                .map((p) => p.value)
                .join("")
            : props.value}
        </span>
        <Show when={props.sufix.length > 0}>
          <span class="text-sm text-muted-foreground">{props.sufix}</span>
        </Show>
      </div>
    </div>
    <div
      class={cn(
        "transition-all w-full border-b border-neutral-200 dark:border-neutral-800 py-4 px-6 leading-none text-muted-foreground absolute -top-full group-hover:top-0 left-0 right-0 backdrop-blur ",
        {
          "bg-neutral-950/10 dark:bg-neutral-100/10 text-black dark:text-white": props.priority === 1,
        },
      )}
    >
      <span class="text-xs">{props.description}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const stats = createAsync(() => getStatistics());
  const rides = createAsync(() => getRides());
  const hotspot = createAsync(() => getHotspot());
  const session = createAsync(() => getAuthenticatedSession());
  const [search, setSearchParams] = useSearchParams();

  const beginningOfRide = (routes: Rides.Info["routes"]) => {
    // get the starting segment of the route and return the streetname
    let found = "No Street Found";
    type SegmentPoint = NonNullable<NonNullable<(typeof routes)[number]["segments"][number]>["points"][number]>;
    let foundSegmentPoint: SegmentPoint | null = null;
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const segments = routes[i].segments;
      for (let j = 0; j < segments.length; j++) {
        const segment = segments[j];
        if (foundSegmentPoint) {
          const points = segment.points;

          for (let k = 0; k < points.length; k++) {
            const point = points[k];
            if (dayjs(point.createdAt).isBefore(foundSegmentPoint.createdAt)) {
              foundSegmentPoint = point;
              break;
            }
          }
        }
        if (foundSegmentPoint === null) {
          foundSegmentPoint = segment.points[0];
          // continue;
        }
      }
    }
    if (foundSegmentPoint) {
      // get streetname based on lat, lng
      found = [foundSegmentPoint.latitude, foundSegmentPoint.longitude].join(",");
    }

    return found;
  };

  const endOfRide = (routes: Rides.Info["routes"]) => {
    // get the ending segment of the route and return the streetname
    let found = "No Street Found";
    type SegmentPoint = NonNullable<NonNullable<(typeof routes)[number]["segments"][number]>["points"][number]>;
    let foundSegmentPoint: SegmentPoint | null = null;
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const segments = routes[i].segments;
      for (let j = 0; j < segments.length; j++) {
        const segment = segments[j];
        if (foundSegmentPoint) {
          const points = segment.points;

          for (let k = 0; k < points.length; k++) {
            const point = points[k];
            if (dayjs(point.createdAt).isAfter(foundSegmentPoint.createdAt)) {
              foundSegmentPoint = point;
              break;
            }
          }
        } else {
          foundSegmentPoint = segment.points[segment.points.length - 1];
        }
      }
    }
    if (foundSegmentPoint) {
      found = [foundSegmentPoint.latitude, foundSegmentPoint.longitude].join(",");
    }
    return found;
  };

  const filteredRides = (rides: Array<Rides.Info>) => {
    if (!search.query) return rides;
    // simple json search
    const found: Array<Rides.Info> = [];
    for (let i = 0; i < rides.length; i++) {
      const ride = rides[i];
      const jString = JSON.stringify(ride);
      if (jString.toLowerCase().includes(search.query.toLowerCase())) {
        found.push(ride);
      }
    }
    return found;
  };

  const sortByStartedAt = (rides: Array<Rides.Info>) => {
    const sortedRides = rides.sort((a, b) => {
      return dayjs(b.startedAt).unix() - dayjs(a.startedAt).unix();
    });
    return sortedRides;
  };

  const groupByMonth = (rides: Array<Rides.Info>) => {
    const months: Record<string, Array<Rides.Info>> = {};
    const sorted = sortByStartedAt(rides);
    for (let i = 0; i < sorted.length; i++) {
      const ride = sorted[i];
      const month = dayjs(ride.startedAt).format("MMMM YYYY");
      if (!months[month]) {
        months[month] = [];
      }
      months[month].push(ride);
    }
    return months;
  };

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <Show
            when={s().organization}
            fallback={
              <div class="flex flex-col w-full pb-4 gap-4">
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
            {(o) => (
              <div class="flex flex-col w-full gap-0 grow">
                <div class="flex flex-col w-full gap-1 sticky top-0 py-4 bg-background border-b border-neutral-200 dark:border-neutral-800 z-10">
                  <h2 class="text-lg font-bold">{o().name}</h2>
                  <span class="text-sm font-medium text-muted-foreground">
                    {o().email} ({o().phoneNumber})
                  </span>
                </div>
                <div class="flex flex-col w-full py-4 gap-4 grow">
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-clip">
                    <Show when={stats() && stats()}>
                      {(ss) => (
                        <For each={Object.entries(ss())}>
                          {([sName, sValue], i) => (
                            <Statistic
                              label={sName}
                              value={sValue.value}
                              prefix={sValue.prefix ?? ""}
                              sufix={sValue.sufix ?? ""}
                              icon={icons[sName]}
                              type={sName === "earnings" ? "currency" : "number"}
                              currency={s().user!.currency_code}
                              priority={sValue.priority}
                              description={sValue.description}
                              index={i()}
                            />
                          )}
                        </For>
                      )}
                    </Show>
                  </div>
                  <div class="flex flex-col-reverse xl:flex-row w-full gap-4 grow">
                    <div class="gap-0 w-full grow">
                      <div class="flex flex-col gap-4 w-full grow">
                        <div class="flex flex-row items-center justify-between gap-4">
                          <div class="flex flex-row items-center gap-4">
                            <span class="font-bold capitalize text-lg">
                              {filteredRides(rides() ?? [])?.length} Rides
                            </span>
                          </div>
                          <div class="flex flex-row items-center gap-2">
                            <TextFieldRoot
                              value={search.query}
                              onChange={(v) =>
                                setSearchParams({
                                  query: v,
                                })
                              }
                            >
                              <TextField placeholder="Search" class="w-full" />
                            </TextFieldRoot>
                            <Button
                              size="sm"
                              class="flex flex-row items-center gap-2 select-none"
                              variant="secondary"
                              onClick={async () => {
                                await revalidate([getRides.key, getLanguage.key]);
                              }}
                            >
                              <span>Refresh</span>
                              <RotateClockwise class="size-4" />
                            </Button>
                            <AddRideModal />
                          </div>
                        </div>
                        <Show when={filteredRides(rides() ?? [])}>
                          {(rs) => (
                            <div class="h-max w-full flex flex-col">
                              <For
                                each={Object.entries(groupByMonth(rs()))}
                                fallback={
                                  <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900">
                                    <span class="text-muted-foreground">There are currently no rides</span>
                                  </div>
                                }
                              >
                                {([month, rides], i) => (
                                  <div class="flex flex-col gap-0 w-full">
                                    <div class="flex flex-row items-center w-full px-4 py-4">
                                      <div class="flex flex-row items-center w-full">
                                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                                      </div>
                                      <div class="flex flex-row items-center w-max">
                                        <span class="text-xs text-muted-foreground w-max px-2 font-medium select-none">
                                          <Show
                                            when={i() === 0}
                                            fallback={`${month} - ${rides.length} Ride${rides.length > 1 ? "s" : ""}`}
                                          >
                                            This Month - {rides.length} Ride{rides.length > 1 ? "s" : ""}
                                          </Show>
                                        </span>
                                      </div>
                                      <div class="flex flex-row items-center w-full">
                                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                                      </div>
                                    </div>
                                    <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-clip">
                                      <For
                                        each={rides}
                                        fallback={
                                          <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900">
                                            <span class="text-muted-foreground">There are currently no rides</span>
                                          </div>
                                        }
                                      >
                                        {(v) => (
                                          <div class="h-max w-full flex flex-col border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                                            <div class="flex flex-row w-full px-6 pt-6 pb-4 items-center justify-between gap-2">
                                              <div class="flex items-center justify-center gap-2 select-none">
                                                <Badge variant="outline" class="flex flex-row items-center gap-2">
                                                  <Car class="size-4 text-muted-foreground" />
                                                  {v.status}
                                                </Badge>
                                              </div>
                                              <div class="">
                                                <span class="font-bold">
                                                  {new Intl.NumberFormat(language() ?? "en-US", {
                                                    style: "currency",
                                                    currency: s().user!.currency_code,
                                                  }).format(Number(v.income))}
                                                </span>
                                              </div>
                                            </div>
                                            <div class="flex flex-col w-full pt-4 pb-6 px-6 gap-2 select-none">
                                              <div class="flex flex-row items-center">
                                                <div class="flex flex-row items-center w-full">
                                                  <div class="size-3.5 rounded-full border-2 border-black dark:border-white p-[2px]">
                                                    <div class="h-full w-full bg-black dark:bg-white rounded-full"></div>
                                                  </div>
                                                  <div class="h-[2px] flex-1 flex bg-muted-foreground"></div>
                                                </div>
                                                <div class="flex flex-row items-center w-max">
                                                  <span class="text-xs text-muted-foreground w-max px-2">
                                                    {new Intl.NumberFormat(language() ?? "en-US", {
                                                      style: "unit",
                                                      unit: "kilometer",
                                                      unitDisplay: "short",
                                                    }).format(Number(v.distance) / 1000)}
                                                  </span>
                                                </div>
                                                <div class="flex flex-row items-center w-full">
                                                  <div class="h-[2px] flex-1 flex bg-muted-foreground"></div>
                                                  <div class="size-3.5 rounded-full bg-black dark:bg-white"></div>
                                                </div>
                                              </div>
                                              <div class="flex flex-row items-center">
                                                <div class="flex flex-row items-center w-full">
                                                  <span class="font-bold text-sm">{beginningOfRide(v.routes)}</span>
                                                </div>
                                                <div class="flex flex-row items-center w-max"></div>
                                                <div class="flex flex-row items-center w-full justify-end">
                                                  <span class="font-bold text-sm">{endOfRide(v.routes)}</span>
                                                </div>
                                              </div>
                                              <div class="flex flex-row items-center justify-end w-full pt-4">
                                                <div class="flex flex-row items-center w-max">
                                                  <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    class="flex flex-row items-center gap-2"
                                                  >
                                                    <span>Open</span>
                                                    <SquareArrowOutUpRight class="size-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  </div>
                                )}
                              </For>
                            </div>
                          )}
                        </Show>
                      </div>
                    </div>
                    <div class="gap-4 flex flex-col xl:w-max w-full xl:min-w-80 h-max min-h-40 ">
                      <div class="flex flex-col h-full w-full border border-yellow-200 dark:border-yellow-800 rounded-2xl min-h-40 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 ">
                        <div class="p-4 flex-col flex h-full w-full grow gap-4">
                          <div class="flex flex-row items-center justify-between gap-2">
                            <span class="font-bold text-black select-none">Hotspot</span>
                            <div class="w-max flex flex-row items-center gap-2">
                              <Button
                                size="icon"
                                class="flex flex-row items-center gap-2 size-8 text-black"
                                variant="ghost"
                                onClick={async () => {
                                  await revalidate([getHotspot.key]);
                                }}
                              >
                                <RotateClockwise class="size-4" />
                              </Button>
                            </div>
                          </div>
                          <Suspense
                            fallback={
                              <div class="flex flex-col items-center justify-center w-full h-full">
                                <Loader2 class="size-4 animate-spin" />
                              </div>
                            }
                          >
                            <Show
                              when={hotspot() && hotspot()!.length > 0 && hotspot()!}
                              keyed
                              fallback={
                                <div class="flex flex-col gap-1 h-full grow bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-yellow-200 shadow-sm select-none items-center justify-center">
                                  <span class="text-sm text-black">No Hotspot at the current time</span>
                                </div>
                              }
                            >
                              {(h) => (
                                <div class="flex flex-row items-center">
                                  <For each={h} fallback={<Skeleton class="w-full h-full" />}>
                                    {(v) => (
                                      <div class="flex flex-row items-center gap-2">
                                        <span>{v.points.join(", ")}</span>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              )}
                            </Show>
                          </Suspense>
                        </div>
                      </div>
                      <div class="flex flex-col h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl min-h-40">
                        <div class="p-4 flex-col flex h-full w-full">
                          <span class="font-bold select-none">Weather</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Show>
        )}
      </Show>
    </div>
  );
}
