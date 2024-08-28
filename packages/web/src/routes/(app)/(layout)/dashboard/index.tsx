import { EarningsTable } from "@/components/data-tables/earnings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEarnings } from "@/lib/api/earnings";
import { getStatistics } from "@/lib/api/statistics";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { createAsync, revalidate, RouteDefinition } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { getSystemNotifications } from "~/lib/api/system_notifications";
import Box from "lucide-solid/icons/box";
import Car from "lucide-solid/icons/car";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Plus from "lucide-solid/icons/plus";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import TrendingUp from "lucide-solid/icons/trending-up";
import { LucideProps } from "node_modules/lucide-solid/dist/types/types";
import { For, JSX, Show } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const earnings = await getEarnings();
    const stats = await getStatistics();
    return { notification, earnings, session, stats };
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
  icon?: (props: LucideProps) => JSX.Element;
  index: number;
}) => (
  <div
    class={cn("flex flex-col p-4 w-full gap-4 select-none", {
      "border-l border-neutral-200 dark:border-neutral-800": props.index > 0,
    })}
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
  const earnings = createAsync(() => getEarnings());

  return (
    <div class="w-full grow flex flex-col">
      <div class="flex flex-col w-full pb-4 gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg">
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
        <div class="flex flex-row w-full gap-4 h-max">
          <div class="gap-0 w-full">
            <div class="flex flex-col gap-4 w-full">
              <div class="flex flex-row items-center justify-between gap-4">
                <div class="flex flex-row items-center gap-4">
                  <span class="font-bold capitalize text-lg">Earnings</span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <Button
                    size="sm"
                    class="flex flex-row items-center gap-2"
                    variant="secondary"
                    onClick={async () => {
                      await revalidate([getEarnings.key]);
                    }}
                  >
                    <span>Refresh</span>
                    <RotateClockwise class="size-4" />
                  </Button>
                  <Button size="sm" class="flex flex-row items-center gap-2">
                    <span>Add</span>
                    <Plus class="size-4" />
                  </Button>
                </div>
              </div>
              <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <Show when={earnings()}>{(es) => <EarningsTable data={es} />}</Show>
              </div>
            </div>
          </div>
          <div class="gap-4 flex flex-col w-max min-w-96 h-max min-h-40 ">
            <div class="flex flex-col h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg min-h-40">
              <div class="p-2 flex-col flex h-full w-full"></div>
            </div>
            <div class="flex flex-col h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg min-h-40">
              <div class="p-2 flex-col flex h-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
