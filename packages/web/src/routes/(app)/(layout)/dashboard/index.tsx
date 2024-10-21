import type { CurrencyCode } from "@/lib/api/application";
import { Events } from "@/components/Events";
import { Hotspots } from "@/components/Hotspots";
import { RealtimeRidesList } from "@/components/RealtimeRidesList";
import { language } from "@/components/stores/Language";
// import { Weather } from "@/components/Weather";
import { getHotspots } from "@/lib/api/hotspots";
import { getRides } from "@/lib/api/rides";
import { getStatistics } from "@/lib/api/statistics";
import { getSystemNotifications } from "@/lib/api/system_notifications";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import { type LucideProps } from "lucide-solid";
import Box from "lucide-solid/icons/box";
import Car from "lucide-solid/icons/car";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Loader2 from "lucide-solid/icons/loader-2";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import TrendingUp from "lucide-solid/icons/trending-up";
import { For, JSX, Show, Suspense } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const rides = await getRides();
    const stats = await getStatistics();
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
      "flex flex-col w-full gap-0 select-none border-l first:border-l-0 border-neutral-200 dark:border-neutral-800 relative overflow-clip group"
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
            ? new Intl.NumberFormat(language(), {
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
            ? new Intl.NumberFormat(language(), {
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
        "transition-all w-full border-b border-neutral-200 dark:border-neutral-800 py-6 px-6 leading-none text-muted-foreground absolute -top-full group-hover:top-0 left-0 right-0 backdrop-blur hidden md:flex",
        {
          "bg-neutral-950/10 dark:bg-neutral-100/10 text-black dark:text-white": props.priority === 1,
        }
      )}
    >
      <span class="text-xs">{props.description}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const stats = createAsync(() => getStatistics());
  const rides = createAsync(() => getRides());
  const session = createAsync(() => getAuthenticatedSession());

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
                  <div class="flex flex-col w-full gap-3 p-6 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <h2 class="text-lg font-bold leading-none">{c().name}</h2>
                    <div class="flex flex-row items-center gap-2">
                      <span class="text-sm font-medium text-muted-foreground">{c().email}</span>
                      <span class="text-sm font-medium text-muted-foreground">({c().phoneNumber})</span>
                    </div>
                  </div>
                  <div class="flex flex-col w-full py-4 gap-4 grow">
                    <div class="grid grid-flow-col md:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-clip">
                      <Suspense
                        fallback={
                          <div class="flex flex-col w-full col-span-full py-10 gap-4 items-center justify-center">
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
                      <Suspense
                        fallback={
                          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                            <Loader2 class="size-4 animate-spin" />
                          </div>
                        }
                      >
                        <Show when={rides() && rides()}>
                          {(rs) => (
                            <RealtimeRidesList
                              ridesList={rs}
                              currency_code={() => s().user?.currency_code ?? "USD"}
                              session={s}
                            />
                          )}
                        </Show>
                      </Suspense>
                      <div class="gap-2 flex flex-col w-full xl:w-80 h-max">
                        {/* <Weather /> */}
                        <Hotspots />
                        <Events />
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
