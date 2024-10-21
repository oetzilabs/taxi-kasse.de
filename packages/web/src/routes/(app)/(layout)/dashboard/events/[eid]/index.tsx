import { RealtimeEvent } from "@/components/RealtimeEvent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLanguage } from "@/lib/api/application";
import { getEvent, removeEvent } from "@/lib/api/events";
import { getAuthenticatedSession } from "@/lib/auth/util";
import {
  A,
  createAsync,
  revalidate,
  RouteDefinition,
  RouteSectionProps,
  useAction,
  useSubmission,
} from "@solidjs/router";
import Pen from "lucide-solid/icons/pen";
import Plus from "lucide-solid/icons/plus";
import RefreshCcw from "lucide-solid/icons/refresh-ccw";
import Trash from "lucide-solid/icons/trash";
import { Show, Suspense } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const language = await getLanguage();
    const event = await getEvent(props.params.eid);
    return { session, language, event };
  },
} satisfies RouteDefinition;

export default function EventsListing(props: RouteSectionProps) {
  const event = createAsync(() => getEvent(props.params.eid));

  const removeEventAction = useAction(removeEvent);
  const removeEventSubmission = useSubmission(removeEvent);

  return (
    <div class="flex flex-col gap-4 w-full">
      <Suspense
        fallback={
          <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
            <span>Loading...</span>
          </div>
        }
      >
        <Show when={event() && event()} fallback={<span>Loading...</span>}>
          {(e) => (
            <div class="w-full flex flex-col gap-4">
              <div class="w-full flex flex-row items-center gap-4 justify-between">
                <h1 class="text-2xl font-bold w-max">{e().name}</h1>
                <div class="flex flex-row items-center gap-2">
                  <Button
                    size="sm"
                    class="flex flex-row items-center gap-2"
                    as={A}
                    href="/dashboard/events/create"
                    variant="outline"
                  >
                    <Plus class="size-4" />
                    <span>Create Event</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger as={Button} size="sm" class="flex flex-row items-center gap-2">
                      <span>Menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem as={A} href={`/dashboard/events/${props.params.eid}/edit`}>
                        <Pen class="size-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>

                      <Dialog>
                        <DialogTrigger
                          as={DropdownMenuItem}
                          class="flex items-center gap-2 text-red-500"
                          closeOnSelect={false}
                        >
                          <Trash class="size-4" />
                          <span>Delete</span>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="ghost">No, Cancel</Button>
                            <Button
                              variant="destructive"
                              disabled={removeEventSubmission.pending}
                              onClick={() => {
                                toast.promise(removeEventAction(e().id), {
                                  loading: "Removing Event",
                                  success: "Removed Event",
                                  error: "Error removing event",
                                });
                              }}
                            >
                              Yes, Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <RealtimeEvent event={e} />
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
