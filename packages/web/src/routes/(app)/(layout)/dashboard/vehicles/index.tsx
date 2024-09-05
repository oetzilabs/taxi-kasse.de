import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVehicles } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import MoreHorizontal from "lucide-solid/icons/more-horizontal";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import Trash from "lucide-solid/icons/trash";
import { For, Show } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const vehicles = getVehicles();
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
          <div class="flex flex-col w-full py-4 gap-6">
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
                <div class="flex flex-col w-full items-center justify-center gap-6">
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
                    {(vehicle) => (
                      <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
                        <div class="flex flex-col p-6 gap-2">
                          <div class="flex flex-row items-center justify-between gap-4">
                            <div class="text-lg font-bold leading-none">
                              <span>{vehicle.name}</span>
                            </div>
                            <div class="text-lg font-bold leading-none">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  as={Button}
                                  size="icon"
                                  class="size-8 rounded-lg"
                                  variant="secondary"
                                >
                                  <MoreHorizontal class="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    class="flex flex-row items-center gap-2"
                                    as={A}
                                    href={`/dashboard/vehicles/${vehicle.id}/edit`}
                                  >
                                    <Pencil class="size-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem class="flex flex-row items-center gap-2">
                                    <Trash class="size-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div class="flex flex-col gap-1 w-full">
                            <span class="text-base font-bold text-muted-foreground">Owner</span>
                            <div class="text-sm">{vehicle.owner.name}</div>
                          </div>
                          <div class="flex flex-col gap-1 w-full">
                            <span class="text-base font-bold text-muted-foreground">Mileage (km)</span>
                            <div class="text-sm">
                              {new Intl.NumberFormat("de-DE", {
                                style: "unit",
                                unit: "kilometer",
                                unitDisplay: "narrow",
                              }).format(Number(vehicle.mileage) * 1000)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </Show>
            <Show when={s().organizations.length > 0}>
              <A
                class="w-full p-4 items-center justify-center flex flex-row gap-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                href="/dashboard/vehicles/new"
              >
                <span>Add Vehicle</span>
                <Plus class="size-4" />
              </A>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
