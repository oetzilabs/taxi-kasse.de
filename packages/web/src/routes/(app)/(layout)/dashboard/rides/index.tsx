import type { Rides } from "@taxikassede/core/src/entities/rides";
import AddRideModal from "@/components/forms/AddRide";
import { language } from "@/components/stores/Language";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { getLanguage } from "@/lib/api/application";
import { getRides } from "@/lib/api/rides";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, revalidate, RouteDefinition, useSearchParams } from "@solidjs/router";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import dayjs from "dayjs";
import Car from "lucide-solid/icons/car";
import Check from "lucide-solid/icons/check";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import SquareArrowOutUpRight from "lucide-solid/icons/square-arrow-out-up-right";
import X from "lucide-solid/icons/x";
import { For, Match, Show, Switch } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const rides = await getRides();
    return { rides, session };
  },
  load: async () => {
    const session = await getAuthenticatedSession();
    const rides = await getRides();
    return { rides, session };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const rides = createAsync(() => getRides());
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
              <div class="flex flex-col w-full gap-0 grow">
                <div class="flex flex-col w-full py-4 gap-4 grow">
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
                                class="w-full max-w-full"
                              />
                            </TextFieldRoot>
                            <Button
                              size="sm"
                              class="flex flex-row items-center gap-2 select-none size-8 md:size-auto p-2 md:px-3 md:py-2"
                              variant="secondary"
                              onClick={async () => {
                                await revalidate([getRides.key, getLanguage.key]);
                              }}
                            >
                              <span class="sr-only md:not-sr-only">Refresh</span>
                              <RotateClockwise class="size-4" />
                            </Button>
                            <AddRideModal
                              vehicle_id_saved={null}
                              vehicle_id_used_last_time={null}
                              base_charge={Number(c().base_charge)}
                              distance_charge={Number(c().distance_charge)}
                              time_charge={Number(c().time_charge)}
                              currency_code={s().user?.currency_code ?? "USD"}
                            />
                          </div>
                        </div>
                        <Show when={filteredRides(rides() ?? [])}>
                          {(rs) => (
                            <div class="h-max w-full flex flex-col">
                              <For
                                each={Object.entries(groupByMonth(rs()))}
                                fallback={
                                  <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                    <span class="text-muted-foreground">There are currently no rides</span>
                                  </div>
                                }
                              >
                                {([month, rides], i) => (
                                  <div class="flex flex-col gap-0 w-full">
                                    <div
                                      class={cn("flex flex-row items-center w-full px-4  py-4", { "px-0": i() === 0 })}
                                    >
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
                                          <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                            <span class="text-muted-foreground">There are currently no rides</span>
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
                                                <Badge variant="outline" class="flex flex-row items-center gap-2">
                                                  <Car class="size-4 text-muted-foreground" />
                                                  <Show
                                                    when={ride.vehicle}
                                                    fallback={<span class="text-sm font-bold">Unknown</span>}
                                                  >
                                                    {(v) => <span class="text-sm font-bold">{v().name}</span>}
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
                                                  <span class="font-bold text-sm">{beginningOfRide(ride.routes)}</span>
                                                </div>
                                                <div class="flex flex-row items-center w-max"></div>
                                                <div class="flex flex-row items-center w-full justify-end">
                                                  <span class="font-bold text-sm">{endOfRide(ride.routes)}</span>
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
                                  </div>
                                )}
                              </For>
                            </div>
                          )}
                        </Show>
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
