import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVehicle, getVehicleById, getVehicles } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import {
  A,
  createAsync,
  revalidate,
  RouteDefinition,
  RouteSectionProps,
  useAction,
  useNavigate,
  useSubmission,
} from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import MoreHorizontal from "lucide-solid/icons/more-horizontal";
import Pencil from "lucide-solid/icons/pencil";
import Trash from "lucide-solid/icons/trash";
import { createSignal, Show, Suspense } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const vehicle = getVehicleById(props.params.vid);
    return { session, vehicle };
  },
  load: async (props) => {
    const session = await getAuthenticatedSession();
    const vehicle = getVehicleById(props.params.vid);
    return { session, vehicle };
  },
} satisfies RouteDefinition;

export default function VehicleVidPage(props: RouteSectionProps) {
  const session = createAsync(() => getAuthenticatedSession());

  const vehicle = createAsync(() => getVehicleById(props.params.vid));

  const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

  const deleteVehicleAction = useAction(deleteVehicle);
  const deleteVehicleState = useSubmission(deleteVehicle);

  const navigate = useNavigate();

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-6">
            <div class="flex flex-col w-full items-center justify-center gap-6">
              <Suspense
                fallback={
                  <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                    <Loader2 class="size-4 animate-spin" />
                  </div>
                }
              >
                <Show
                  when={vehicle() && vehicle()}
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
                  {(vehicle) => (
                    <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
                      <div class="flex flex-col p-6 gap-6">
                        <div class="flex flex-row gap-2 w-full items-start justify-between">
                          <div class="flex flex-col gap-2 w-full">
                            <span class="font-bold text-muted-foreground">Name</span>
                            <div class="flex flex-row items-center gap-2">
                              <span class="text-sm font-bold">{vehicle().name}</span>
                            </div>
                          </div>
                          <div class="flex flex-row items-center gap-2">
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
                                  href={`/dashboard/vehicles/${vehicle().id}/edit`}
                                >
                                  <Pencil class="size-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <Dialog open={openDeleteDialog()} onOpenChange={setOpenDeleteDialog}>
                                  <DialogTrigger
                                    as={DropdownMenuItem}
                                    class="flex flex-row items-center gap-2 text-red-500 hover:!bg-red-200 dark:hover:!bg-red-800 hover:!text-red-600 dark:hover:!text-red-500"
                                    closeOnSelect={false}
                                  >
                                    <Trash class="size-4" />
                                    <span>Delete</span>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                                      <DialogDescription>
                                        This action cannot be undone. This will permanently delete your vehicle and
                                        remove your data from our servers.
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
                                          toast.promise(deleteVehicleAction(vehicle().id), {
                                            loading: "Deleting vehicle...",
                                            success: () => {
                                              setOpenDeleteDialog(false);
                                              navigate(`/dashboard/vehicles`);
                                              return "Vehicle deleted successfully!";
                                            },
                                            error: "Something went wrong while deleting the vehicle.",
                                          });

                                          await revalidate([getVehicles.key, getVehicleById.keyFor(vehicle().id)]);
                                        }}
                                      >
                                        <Show when={deleteVehicleState.pending} fallback="Yes, Delete">
                                          <span class="text-sm">Deleting Vehicle...</span>
                                          <Loader2 class="size-4 animate-spin" />
                                        </Show>
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                          <span class="font-bold text-muted-foreground">Mileage (km)</span>
                          <div class="flex flex-row items-center gap-2">
                            <span class="text-sm font-bold">
                              {new Intl.NumberFormat("de-DE", {
                                style: "unit",
                                unit: "kilometer",
                                unitDisplay: "narrow",
                              }).format(Number(vehicle().mileage))}
                            </span>
                          </div>
                        </div>
                        <div class="flex flex-row items-center justify-end gap-4"></div>
                      </div>
                    </div>
                  )}
                </Show>
              </Suspense>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
