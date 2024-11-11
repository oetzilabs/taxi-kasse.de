import { language } from "@/components/stores/Language";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRide, getRides, removeRide } from "@/lib/api/rides";
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
import { clientOnly } from "@solidjs/start";
import { getStatistics } from "~/lib/api/statistics";
import Car from "lucide-solid/icons/car";
import Loader2 from "lucide-solid/icons/loader-2";
import Pen from "lucide-solid/icons/pen";
import Trash from "lucide-solid/icons/trash";
import { createSignal, Show } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const rid = props.params.rid;
    const ride = await getRide(rid);
    return { ride, session };
  },
} satisfies RouteDefinition;

const ClientRouteMap = clientOnly(() => import("@/components/ClientRouteMap"));

export default function RideRidPage(props: RouteSectionProps) {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const ride = createAsync(() => getRide(props.params.rid));

  const obscureId = (id: string) => {
    const firstSix = id.substring(0, 6);
    const rest = id.substring(6);
    return firstSix + "*".repeat(rest.length);
  };

  const [openDeleteModal, setOpenDeleteModal] = createSignal(false);
  const removeRideAction = useAction(removeRide);
  const removeRideStatus = useSubmission(removeRide);

  const navigate = useNavigate();

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session() && session()!.user !== null && session()}>
        {(s) => (
          <div class="flex flex-col p-4 w-full">
            <Show when={ride() && ride()}>
              {(r) => (
                <div class="w-full flex-col flex gap-2">
                  <div class="flex flex-col p-2 w-full">
                    <div class="flex flex-row items-start justify-between gap-2 w-full">
                      <div class="flex flex-col w-full gap-2">
                        <div class="flex flex-row gap-4">
                          <span class="text-xs text-muted-foreground">{obscureId(r().id.split("ride_")[1])}</span>
                          <span class="text-xs">{r().status}</span>
                        </div>
                        <div class="flex flex-row items-center gap-2">
                          <Car class="size-4" />
                          <Show when={r().vehicle}>{(v) => <span class="text-sm font-bold">{v().name}</span>}</Show>
                        </div>
                        <div class="flex flex-row items-center gap-2">
                          <span class="text-sm font-bold">Route:</span>
                          <span class="text-sm font-bold">
                            {r().departure} - {r().arrival}
                          </span>
                        </div>
                        <div class="flex flex-row items-center gap-2">
                          <span class="text-sm font-bold">Charged</span>
                          <span class="text-sm font-bold">
                            {new Intl.NumberFormat(language(), {
                              style: "currency",
                              currency: s().user!.currency_code,
                            }).format(Number(r().income))}
                          </span>
                        </div>
                      </div>
                      <div class="flex flex-col w-max items-start justify-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger as={Button} size="sm">
                            Menu
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem as={A} href={`/dashboard/rides/${r().id}/edit`}>
                              <Pen class="size-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <Dialog open={openDeleteModal()} onOpenChange={setOpenDeleteModal}>
                              <DialogTrigger
                                as={DropdownMenuItem}
                                class="flex flex-row items-center gap-2 text-red-500 hover:!bg-red-200 dark:hover:!bg-red-800 hover:!text-red-600 dark:hover:!text-red-500"
                                closeOnSelect={false}
                              >
                                <Trash class="size-4" />
                                <span>Delete</span>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>Delete Ride?</DialogHeader>
                                <DialogDescription>
                                  Are you sure you want to delete this ride? This action cannot be undone. All data
                                  associated with this ride will be deleted.
                                </DialogDescription>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setOpenDeleteModal(false);
                                    }}
                                  >
                                    No, Cancel!
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    disabled={removeRideStatus.pending}
                                    onClick={async () => {
                                      toast.promise(removeRideAction(r().id), {
                                        loading: "Deleting Ride",
                                        success: () => {
                                          setOpenDeleteModal(false);
                                          navigate(`/dashboard/rides`);
                                          return "Ride deleted";
                                        },
                                        error: (e) => `Failed to delete ride: ${e.message}`,
                                      });
                                      await revalidate([getRides.key, getRide.keyFor(r().id), getStatistics.key]);
                                    }}
                                  >
                                    <Show when={removeRideStatus.pending} fallback="Yes, Delete">
                                      <span class="text-sm">Deleting Ride...</span>
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
                  </div>
                  <div class="flex flex-col p-2 w-full border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <span class="font-bold pb-2 pl-1">Map</span>
                    <div class="min-h-[600px] border border-neutral-200 dark:border-neutral-800 overflow-clip rounded-lg">
                      <Show
                        when={
                          r().geometry &&
                          r().arrivalCoordinates[0] !== 0 &&
                          r().arrivalCoordinates[1] !== 0 &&
                          r().departureCoordinates[0] !== 0 &&
                          r().departureCoordinates[1] !== 0
                        }
                        fallback={
                          <div class="flex flex-col w-full bg-neutral-100 dark:bg-neutral-900 rounded-lg h-full items-center justify-center">
                            <span class="text-sm text-muted-foreground">No route found</span>
                          </div>
                        }
                      >
                        <ClientRouteMap
                          from={() => r().departureCoordinates}
                          to={() => r().arrivalCoordinates}
                          geometry={() => r().geometry}
                          fallback={
                            <div class="flex flex-col w-full bg-neutral-100 dark:bg-neutral-900 rounded-lg h-full"></div>
                          }
                        />
                      </Show>
                    </div>
                  </div>
                  <div class="flex flex-col p-2 w-full">
                    <span class="text-xs text-muted-foreground"></span>
                    <span class="text-sm"></span>
                  </div>
                </div>
              )}
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
