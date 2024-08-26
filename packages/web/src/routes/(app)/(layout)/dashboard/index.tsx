import { Button } from "@/components/ui/button";
import { getEarnings } from "@/lib/api/earnings";
import { getSystemNotifications, hideSystemNotification } from "@/lib/api/system-notifications";
import { createAsync, RouteDefinition, useAction } from "@solidjs/router";
import Car from "lucide-solid/icons/car";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Info from "lucide-solid/icons/info";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import TrendingUp from "lucide-solid/icons/trending-up";
import X from "lucide-solid/icons/x";
import { For, Show } from "solid-js";
import { EarningsTable } from "../../../../components/data-tables/earnings";
import { getAuthenticatedSession } from "../../../../lib/auth/util";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notification = await getSystemNotifications();
    const earnings = await getEarnings();
    return { notification, earnings, session };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const notification = createAsync(() => getSystemNotifications());
  const earnings = createAsync(() => getEarnings());

  const hideSystemNotificationAction = useAction(hideSystemNotification);

  return (
    <div class="w-full grow flex flex-col">
      <div class="flex flex-col grow">
        <div class="flex flex-row gap-0 w-full grow">
          <div class="flex flex-col w-full p-4 gap-4">
            <Show when={notification()}>
              {(ns) => (
                <For each={ns()}>
                  {(n) => (
                    <div
                      class="w-full flex flex-row items-center justify-between gap-4 pl-5 pr-2.5 py-2 rounded-lg"
                      style={{
                        "background-color": n.bgColor,
                        color: n.textColor,
                      }}
                    >
                      <div class="flex flex-row items-center gap-4">
                        <Info class="size-4" />
                        <span>{n.message}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          hideSystemNotificationAction(n.id);
                        }}
                        class="size-8"
                      >
                        <X class="size-4" />
                      </Button>
                    </div>
                  )}
                </For>
              )}
            </Show>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div class="p-4">
                <div class="flex flex-col items-start gap-2">
                  <Car class="size-4 text-muted-foreground" />
                  <div>
                    <h2 class="font-semibold">Total Rides</h2>
                    <p class="text-3xl font-bold">152</p>
                  </div>
                </div>
              </div>
              <div class="border-l border-neutral-200 dark:border-neutral-800 p-4">
                <div class="flex flex-col items-start gap-2">
                  <DollarSign class="size-4 text-muted-foreground" />
                  <div>
                    <h2 class="font-semibold">Total Earnings</h2>
                    <p class="text-3xl font-bold">$3,540</p>
                  </div>
                </div>
              </div>
              <div class="border-l border-neutral-200 dark:border-neutral-800 p-4">
                <div class="flex flex-col items-start gap-2">
                  <ShoppingBag class="size-4 text-muted-foreground" />
                  <div>
                    <h2 class="font-semibold">Total Orders</h2>
                    <p class="text-3xl font-bold">78</p>
                  </div>
                </div>
              </div>
              <div class="border-l border-neutral-200 dark:border-neutral-800 p-4">
                <div class="flex flex-col items-start gap-2">
                  <TrendingUp class="size-4 text-muted-foreground" />
                  <div>
                    <h2 class="font-semibold">Performance</h2>
                    <p class="text-3xl font-bold">8.4/10</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-row w-full gap-4 h-max">
              <div class="gap-0 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div class="w-full">
                  <Show when={earnings()}>{(e) => <EarningsTable data={e} />}</Show>
                </div>
              </div>
              <div class="gap-0 w-96 h-max min-h-40 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div class="p-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
