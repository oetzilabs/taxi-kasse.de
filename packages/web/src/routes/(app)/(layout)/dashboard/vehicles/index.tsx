import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVehicle, getVehicleById, getVehicles } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Loader2 from "lucide-solid/icons/loader-2";
import MoreHorizontal from "lucide-solid/icons/more-horizontal";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import Trash from "lucide-solid/icons/trash";
import { createSignal, For, Show, Suspense } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const vehicles = getVehicles();
    return { session, vehicles };
  },
  load: async () => {
    const session = await getAuthenticatedSession();
    const vehicles = getVehicles();
    return { session, vehicles };
  },
} satisfies RouteDefinition;

export default function VehiclesPage() {
  const session = createAsync(() => getAuthenticatedSession());

  const vehicles = createAsync(() => getVehicles());
  const deleteVehicleAction = useAction(deleteVehicle);
  const deleteVehicleState = useSubmission(deleteVehicle);

  const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

  return (
    <div class="w-full grow flex flex-col">
      <Suspense
        fallback={
          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <Show when={session()}>
          {(s) => (
            <div class="flex flex-col w-full py-4 gap-6">
              <div class="w-full flex flex-row items-center justify-between">
                <div class="w-full font-bold text-lg">Vehicles</div>
                <div class="w-max flex flex-row items-center justify-end gap-2">
                  <Button size="sm" as={A} href="/dashboard/vehicles/new" class="gap-2">
                    <span class="w-max">Add Vehicle</span>
                    <Plus class="size-4" />
                  </Button>
                </div>
              </div>
              <Suspense
                fallback={
                  <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                    <Loader2 class="size-4 animate-spin" />
                  </div>
                }
              >
                <Show
                  when={vehicles() && vehicles()}
                  fallback={
                    <div class="flex flex-col w-full pb-4 gap-4">
                      <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                        <span class="text-sm">You currently have no vehicles.</span>
                        <span class="text-sm">
                          Please{" "}
                          <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                            create a vehicle
                          </A>{" "}
                          to view your list of vehicles.
                        </span>
                      </div>
                    </div>
                  }
                >
                  {(vs) => (
                    <div class="grid grid-cols-4 w-full items-center justify-center gap-6">
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
                                      <Dialog open={openDeleteDialog()} onOpenChange={setOpenDeleteDialog}>
                                        <DialogTrigger
                                          as={DropdownMenuItem}
                                          class="flex flex-row items-center gap-2"
                                          closeOnSelect={false}
                                        >
                                          <Trash class="size-4" />
                                          <span>Delete</span>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                                            <DialogDescription>
                                              This action cannot be undone. This will permanently delete your vehicle
                                              and remove your data from our servers.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter>
                                            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)}>
                                              No, Cancel!
                                            </Button>
                                            <Button
                                              disabled={deleteVehicleState.pending}
                                              variant="destructive"
                                              onClick={async () => {
                                                toast.promise(deleteVehicleAction(vehicle.id), {
                                                  loading: "Deleting vehicle...",
                                                  success: () => {
                                                    setOpenDeleteDialog(false);
                                                    return "Vehicle deleted successfully!";
                                                  },
                                                  error: "Something went wrong while deleting the vehicle.",
                                                });
                                                await revalidate([getVehicles.key, getVehicleById.keyFor(vehicle.id)]);
                                              }}
                                            >
                                              Yes, Delete!
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
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
                                  }).format(Number(vehicle.mileage))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </Show>
              </Suspense>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
