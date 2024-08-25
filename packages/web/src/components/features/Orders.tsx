import { createAsync } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { getOrders } from "../../lib/api/orders";

type OrdersProps = {};

export default function Orders(props: OrdersProps) {
  const orders = createAsync(() => getOrders());
  return (
    <div class="px-4 grid gap-4 w-full">
      <div class="relative w-full flex flex-row items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <Show when={orders() && orders()}>
            {(os) => (
              <For each={os()} fallback={<div>Loading...</div>}>
                {(order) => (
                  <div class="w-full rounded-lg bg-white shadow-md">
                    <div class="flex flex-row items-center justify-between p-4">
                      <div class="flex flex-row items-center">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <div class="text-sm font-bold text-gray-700">{order.dest.streetname}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            )}
          </Show>
        </Suspense>
      </div>
    </div>
  );
}
