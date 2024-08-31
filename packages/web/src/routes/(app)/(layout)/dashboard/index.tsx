import { EarningsTable } from "@/components/data-tables/earnings";
import AddRideModal from "@/components/forms/AddRide";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHotspot } from "@/lib/api/orders";
import { getRides } from "@/lib/api/rides";
import { getStatistics } from "@/lib/api/statistics";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, revalidate, RouteDefinition } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { getSystemNotifications } from "~/lib/api/system_notifications";
import { LucideProps } from "lucide-solid";
import Box from "lucide-solid/icons/box";
import Car from "lucide-solid/icons/car";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Loader2 from "lucide-solid/icons/loader-2";
import Plus from "lucide-solid/icons/plus";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import TrendingUp from "lucide-solid/icons/trending-up";
import { For, JSX, Show, Suspense } from "solid-js";

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
  icon?: (props: LucideProps) => JSX.Element;
  index: number;
}) => (
  <div
    class={cn(
      "flex flex-col p-4 w-full gap-4 select-none border-t lg:border-l lg:border-t-0 first:border-l-0 first:border-t-0 border-neutral-200 dark:border-neutral-800",
    )}
  >
    <div class="flex flex-row items-center justify-between gap-4">
      <Show when={props.icon !== undefined && props.icon} fallback={<Box />} keyed>
        {(Ic) => <Ic class="size-4 text-muted-foreground" />}
      </Show>
      <span class="font-bold uppercase text-xs text-muted-foreground">{props.label}</span>
    </div>
    <div class="flex flex-row items-center justify-between gap-4">
      <div class=""></div>
      <div class="text-3xl font-bold">
        {props.prefix} {props.value} <span class="text-sm text-muted-foreground">{props.sufix}</span>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const stats = createAsync(() => getStatistics());
  const rides = createAsync(() => getRides());
  const hotspot = createAsync(() => getHotspot());
  const session = createAsync(() => getAuthenticatedSession());

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
                    <A href="/organizations/add" class="hover:underline text-blue-500 font-medium">
                      create/join an organization
                    </A>{" "}
                    to view your dashboard
                  </span>
                </div>
              </div>
            }
          >
            {(o) => (
              <div class="flex flex-col w-full pb-4 gap-4">
                <div class="flex flex-col w-full gap-1">
                  <h2 class="text-lg font-bold">{o().name}</h2>
                  <span class="text-sm font-medium text-muted-foreground">
                    {o().email} ({o().phoneNumber})
                  </span>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg">
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
                            index={i()}
                          />
                        )}
                      </For>
                    )}
                  </Show>
                </div>
                <div class="flex flex-col-reverse xl:flex-row w-full gap-4 h-max">
                  <div class="gap-0 w-full">
                    <div class="flex flex-col gap-4 w-full">
                      <div class="flex flex-row items-center justify-between gap-4">
                        <div class="flex flex-row items-center gap-4">
                          <span class="font-bold capitalize text-lg">Rides</span>
                        </div>
                        <div class="flex flex-row items-center gap-2">
                          <Button
                            size="sm"
                            class="flex flex-row items-center gap-2 select-none"
                            variant="secondary"
                            onClick={async () => {
                              await revalidate([getRides.key]);
                            }}
                          >
                            <span>Refresh</span>
                            <RotateClockwise class="size-4" />
                          </Button>
                          <AddRideModal />
                        </div>
                      </div>
                      <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col overflow-clip">
                        <Show when={rides()}>
                          {(r) => (
                            <div class="h-max w-full flex flex-col">
                              <For
                                each={r()}
                                fallback={
                                  <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900">
                                    <span class="text-muted-foreground">There are currently no rides</span>
                                  </div>
                                }
                              >
                                {(v) => (
                                  <div class="h-max w-full flex flex-col border-b border-neutral-200 dark:border-neutral-800">
                                    <div class="flex flex-row w-full p-2 items-center justify-between gap-2">
                                      <div class="">
                                        <span class="font-bold text-black">{v.distance} km</span>
                                      </div>
                                      <div class=""></div>
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
                  <div class="gap-4 flex flex-col xl:w-max w-full xl:min-w-80 h-max min-h-40 ">
                    <div class="flex flex-col h-full w-full border border-yellow-200 dark:border-yellow-800 rounded-lg min-h-40 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 ">
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
                              <div class="flex flex-col gap-1 h-full grow bg-white/5 backdrop-blur-sm rounded-md p-2 border border-yellow-200 shadow-sm select-none">
                                <span class="text-sm text-black ">No Hotspot at the current time</span>
                                <div class="flex grow h-full" />
                                <span class="text-sm text-muted-foreground">
                                  Please try again later or{" "}
                                  <A href="/contact" class="hover:underline">
                                    contact us
                                  </A>{" "}
                                  if you think this is a bug.
                                </span>
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
                    <div class="flex flex-col h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg min-h-40">
                      <div class="p-4 flex-col flex h-full w-full">
                        <span class="font-bold select-none">Weather</span>
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
