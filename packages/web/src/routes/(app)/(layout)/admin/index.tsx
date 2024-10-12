import type { CurrencyCode } from "@/lib/api/application";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { LucideProps } from "lucide-solid";
import AddRideModal from "@/components/forms/AddRide";
import { Hotspots } from "@/components/Hotspots";
import { language } from "@/components/stores/Language";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Weather } from "@/components/Weather";
import { getLanguage } from "@/lib/api/application";
import { getHotspots } from "@/lib/api/hotspots";
import { getSystemRides } from "@/lib/api/rides";
import { getSystemStatistics } from "@/lib/api/statistics";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync, revalidate, RouteDefinition, useSearchParams } from "@solidjs/router";
import dayjs from "dayjs";
import Box from "lucide-solid/icons/box";
import Car from "lucide-solid/icons/car";
import Check from "lucide-solid/icons/check";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import SquareArrowOutUpRight from "lucide-solid/icons/square-arrow-out-up-right";
import TrendingUp from "lucide-solid/icons/trending-up";
import X from "lucide-solid/icons/x";
import { createSignal, For, JSX, Match, Show, Suspense, Switch } from "solid-js";
import { Transition } from "solid-transition-group";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const rides = await getSystemRides();
    const stats = await getSystemStatistics();
    const hotspot = await getHotspots();
    return { notification, rides, session, stats, hotspot };
  },
} satisfies RouteDefinition;

const icons: Record<string, (props: LucideProps) => JSX.Element> = {
  rides: Car,
  earnings: DollarSign,
  orders: ShoppingBag,
  performance: TrendingUp,
};

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
      "flex flex-col w-full gap-0 select-none border-l first:border-l-0 border-neutral-200 dark:border-neutral-800 relative overflow-clip group",
    )}
  >
    <div class="flex flex-row items-center justify-between gap-2 md:px-6 md:pb-4 md:pt-6 px-3 py-2">
      <div class="flex-1 size-4">
        <Show when={props.icon !== undefined && props.icon} fallback={<Box />} keyed>
          {(Ic) => <Ic class="size-4 text-muted-foreground" />}
        </Show>
      </div>
      <span class="font-bold uppercase text-xs text-muted-foreground md:flex hidden">{props.label}</span>
      <div class="transition-[font-size] text-base md:text-3xl font-bold md:hidden flex flex-row items-baseline gap-2">
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
    <div class="flex-row items-center justify-between gap-4 px-6 py-4 hidden md:flex">
      <div class=""></div>
      <div class="transition-[font-size] text-base md:text-3xl font-bold flex flex-row items-baseline gap-2">
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
        "transition-all w-full border-b border-neutral-200 dark:border-neutral-800 py-4 px-6 leading-none text-muted-foreground absolute -top-full group-hover:top-0 left-0 right-0 backdrop-blur hidden md:flex",
        {
          "bg-neutral-950/10 dark:bg-neutral-100/10 text-black dark:text-white": props.priority === 1,
        },
      )}
    >
      <span class="text-xs">{props.description}</span>
    </div>
  </div>
);

type DotNotation<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? DotNotation<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`>
    : `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`;
}[keyof T];

const stringify = <T extends any>(obj: T) => {
  const t = typeof obj;
  if (t === "string") return obj as string;
  if (t === "number") return (obj as number).toString();
  if (t === "boolean") return (obj as boolean).toString();
  if (t === "object") {
    if (obj === null) return "null";
    if (Array.isArray(obj)) {
      const arr: Array<string> = [];
      for (let i = 0; i < obj.length; i++) {
        arr.push(stringify(obj[i]));
      }
      return `[${arr.join(",")}]`;
    }
    const o = obj as Record<string, unknown>;
    const objKeys = Object.keys(o);
    const objValues: any[] = objKeys.map((k) => stringify(o[k]));
    return `{${objKeys.map((k, i) => `${k}:${objValues[i]}`).join(",")}}`;
  }
  return "null";
};

type DotN = Omit<Rides.Info, "vehicle" | "user" | "routes"> & { vehicle: NonNullable<Rides.Info["vehicle"]> };

const traverse = <T extends DotN>(obj: any, path: DotNotation<T>) => {
  // @ts-ignore
  const paths = path.split(".");
  let current = obj;
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (current[path] === undefined) {
      return undefined;
    }
    current = current[path];
  }
  return current;
};

export default function AdminDashboardPage() {
  const stats = createAsync(() => getSystemStatistics());
  const rides = createAsync(() => getSystemRides());
  const session = createAsync(() => getAuthenticatedSession());
  const [search, setSearchParams] = useSearchParams();

  const [hiddenMonths, setHiddenMonths] = createSignal<Array<string>>([]);

  const beginningOfRide = (routes: Rides.Info["routes"]) => {
    // get the starting segment of the route and return the streetname
    let found = "No Department";
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
    let found = "No Arrival";
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

    const fields: Array<DotNotation<DotN>> = [
      "id",
      "added_by",
      "distance",
      "income",
      "rating",
      "status",
      "vehicle.name",
    ];
    const found: Array<Rides.Info> = [];
    for (let i = 0; i < rides.length; i++) {
      const ride = rides[i];
      // if (ride.vehicle === null) {
      //   continue;
      // }
      for (let j = 0; j < fields.length; j++) {
        const k = fields[j];
        // @ts-ignore
        const value = traverse(ride, k);
        if (value !== undefined) {
          if (value.toLowerCase().includes(search.query.toLowerCase())) {
            found.push(ride);
          }
        }
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
                <div class="flex flex-col w-full gap-0 grow relative py-4">
                  <div class="flex flex-col w-full pb-4 gap-4 grow">
                    <div class="grid grid-flow-col md:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-clip">
                      <Suspense
                        fallback={
                          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                            <Loader2 class="size-4 animate-spin" />
                          </div>
                        }
                      >
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
                      </Suspense>
                    </div>
                    <div class="flex flex-col-reverse xl:flex-row w-full gap-4 grow">
                      <div class="gap-0 w-full grow">
                        <div class="flex flex-col gap-2 w-full grow">
                          <div class="flex flex-row items-center justify-between gap-0">
                            <div class="flex flex-row items-center gap-4 w-min"></div>
                            <div class="flex flex-row items-center gap-2 w-full">
                              <TextFieldRoot
                                value={search.query}
                                onChange={(v) =>
                                  setSearchParams({
                                    query: v,
                                  })
                                }
                                class="w-full max-w-full"
                              >
                                <TextField
                                  placeholder={`Search across ${filteredRides(rides() ?? [])?.length} rides`}
                                  class="w-full max-w-full h-8 text-xs"
                                />
                              </TextFieldRoot>
                              <Button
                                size="sm"
                                class="flex flex-row items-center gap-2 select-none size-8 md:size-auto p-2 md:px-3 md:py-2"
                                variant="secondary"
                                onClick={async () => {
                                  await revalidate([getSystemRides.key, getLanguage.key, getSystemStatistics.key]);
                                }}
                              >
                                <span class="sr-only md:not-sr-only">Refresh</span>
                                <RotateClockwise class="size-4" />
                              </Button>
                              {/* <AddRideModal
                                vehicle_id_saved={null}
                                vehicle_id_used_last_time={null}
                                base_charge={Number(c().base_charge)}
                                distance_charge={Number(c().distance_charge)}
                                time_charge={Number(c().time_charge)}
                                currency_code={s().user?.currency_code ?? "USD"}
                              /> */}
                            </div>
                          </div>
                          <Suspense
                            fallback={
                              <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                                <Loader2 class="size-4 animate-spin" />
                              </div>
                            }
                          >
                            <Show when={rides() && rides()}>
                              {(rs) => (
                                <Show when={filteredRides(rs() ?? [])}>
                                  {(_rides) => (
                                    <div class="h-max w-full flex flex-col">
                                      <For
                                        each={Object.entries(groupByMonth(_rides()))}
                                        fallback={
                                          <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                            <span class="text-muted-foreground">There are currently no rides</span>
                                          </div>
                                        }
                                      >
                                        {([month, rides], i) => (
                                          <div class="flex flex-col gap-0 w-full">
                                            <div
                                              class={cn(
                                                "flex flex-row items-center w-full px-8 py-4 transition-[padding] duration-300",
                                                {
                                                  "px-0":
                                                    i() === 0 || hiddenMonths().includes(`${month}-${rides.length}`),
                                                  "pb-0": hiddenMonths().includes(`${month}-${rides.length}`),
                                                },
                                              )}
                                            >
                                              <div class="flex flex-row items-center w-full">
                                                <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                                              </div>
                                              <div class="flex flex-row items-center w-max px-2 gap-1">
                                                <span class="text-xs text-muted-foreground w-max font-medium select-none">
                                                  <Show
                                                    when={i() === 0}
                                                    fallback={`${month} - ${rides.length} Ride${rides.length > 1 ? "s" : ""}`}
                                                  >
                                                    This Month - {rides.length} Ride{rides.length > 1 ? "s" : ""}
                                                  </Show>
                                                </span>
                                                <span class="text-xs text-muted-foreground w-max font-medium select-none">
                                                  -
                                                </span>
                                                <div
                                                  class="text-xs text-muted-foreground w-max font-medium select-none hover:underline cursor-pointer"
                                                  onClick={() => {
                                                    const isH = hiddenMonths().includes(`${month}-${rides.length}`);
                                                    if (isH) {
                                                      setHiddenMonths(
                                                        hiddenMonths().filter((m) => m !== `${month}-${rides.length}`),
                                                      );
                                                    } else {
                                                      const concatted = concat(
                                                        hiddenMonths,
                                                        `${month}-${rides.length}`,
                                                      );
                                                      setHiddenMonths(concatted());
                                                    }
                                                  }}
                                                >
                                                  <Show
                                                    when={!hiddenMonths().includes(`${month}-${rides.length}`)}
                                                    fallback="Show"
                                                  >
                                                    Hide
                                                  </Show>
                                                </div>
                                              </div>
                                              <div class="flex flex-row items-center w-full">
                                                <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                                              </div>
                                            </div>
                                            <Transition name="slide-fade-up">
                                              <Show when={!hiddenMonths().includes(`${month}-${rides.length}`)}>
                                                <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-clip">
                                                  <For
                                                    each={rides}
                                                    fallback={
                                                      <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                                        <span class="text-muted-foreground">
                                                          There are currently no rides
                                                        </span>
                                                      </div>
                                                    }
                                                  >
                                                    {(ride) => (
                                                      <div class="h-max w-full flex flex-col border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                                                        <div class="flex flex-row w-full px-6 pt-6 pb-4 items-center justify-between gap-2">
                                                          <div class="flex items-center justify-center gap-2 select-none">
                                                            <Tooltip>
                                                              <TooltipTrigger>
                                                                <div class="size-5 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800">
                                                                  <Switch>
                                                                    <Match when={ride.status === "accepted"}>
                                                                      <Check class="size-3 text-muted-foreground" />
                                                                    </Match>
                                                                    <Match when={ride.status === "pending"}>
                                                                      <Loader2 class="size-3 animate-spin" />
                                                                    </Match>
                                                                    <Match when={ride.status === "rejected"}>
                                                                      <X class="size-3 text-red-500" />
                                                                    </Match>
                                                                  </Switch>
                                                                </div>
                                                              </TooltipTrigger>
                                                              <TooltipContent class="uppercase font-bold">
                                                                {ride.status}
                                                              </TooltipContent>
                                                            </Tooltip>
                                                            <Badge
                                                              variant="outline"
                                                              class="flex flex-row items-center gap-2"
                                                            >
                                                              <Car class="size-4 text-muted-foreground" />
                                                              <Show
                                                                when={ride.vehicle}
                                                                fallback={
                                                                  <span class="text-sm font-bold">Unknown</span>
                                                                }
                                                              >
                                                                {(v) => (
                                                                  <span class="text-sm font-bold">{v().name}</span>
                                                                )}
                                                              </Show>
                                                            </Badge>
                                                          </div>
                                                          <div class="">
                                                            <span class="font-bold">
                                                              {new Intl.NumberFormat(language() ?? "en-US", {
                                                                style: "currency",
                                                                currency: s().user!.currency_code,
                                                              }).format(Number(ride.income))}
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
                                                                }).format(Number(ride.distance) / 1000)}
                                                              </span>
                                                            </div>
                                                            <div class="flex flex-row items-center w-full">
                                                              <div class="h-[2px] flex-1 flex bg-muted-foreground"></div>
                                                              <div class="size-3.5 rounded-full bg-black dark:bg-white"></div>
                                                            </div>
                                                          </div>
                                                          <div class="flex flex-row items-center">
                                                            <div class="flex flex-row items-center w-full">
                                                              <span class="font-bold text-sm">
                                                                {beginningOfRide(ride.routes)}
                                                              </span>
                                                            </div>
                                                            <div class="flex flex-row items-center w-max"></div>
                                                            <div class="flex flex-row items-center w-full justify-end">
                                                              <span class="font-bold text-sm">
                                                                {endOfRide(ride.routes)}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div class="flex flex-row items-center justify-end w-full pt-4">
                                                            <div class="flex flex-row items-center w-max">
                                                              <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                class="flex flex-row items-center gap-2"
                                                                as={A}
                                                                href={`/dashboard/rides/${ride.id}`}
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
                                              </Show>
                                            </Transition>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  )}
                                </Show>
                              )}
                            </Show>
                          </Suspense>
                        </div>
                      </div>
                      <div class="gap-4 flex flex-row xl:flex-col xl:w-max w-full xl:min-w-80 h-max min-h-40 max-h-40 md:max-h-full ">
                        <Hotspots />
                        <Weather />
                      </div>
                    </div>
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
