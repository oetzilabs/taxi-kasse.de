import { getVehicles } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import { For, Show } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const vehicles = createAsync(() => getVehicles());
    return { session, vehicles };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());

  const vehicles = createAsync(() => getVehicles());

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full pb-4 gap-4">
            <Show
              when={vehicles()}
              fallback={
                <div class="flex flex-col w-full pb-4 gap-4">
                  <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                    <span class="text-sm">You currently have no vehicles.</span>
                    <span class="text-sm">
                      Please{" "}
                      <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                        create/join a vehicle
                      </A>{" "}
                      to view your list of vehicles.
                    </span>
                  </div>
                </div>
              }
            >
              {(vs) => (
                <For
                  each={vs()}
                  fallback={
                    <div class="flex flex-col w-full pb-4 gap-4">
                      <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                        <span class="text-sm">You currently have no vehicles.</span>
                        <span class="text-sm">
                          Please{" "}
                          <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                            create a vehicle
                          </A>{" "}
                          first.
                        </span>
                      </div>
                    </div>
                  }
                >
                  {(vehicle) => <div class="">{vehicle.name}</div>}
                </For>
              )}
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
