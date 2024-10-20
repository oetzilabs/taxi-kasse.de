import { RealtimeEventsList } from "@/components/RealtimeEventsList";
import { Button } from "@/components/ui/button";
import { getLanguage } from "@/lib/api/application";
import { getEvents } from "@/lib/api/events";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, revalidate, RouteDefinition } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import RefreshCcw from "lucide-solid/icons/refresh-ccw";
import { Show, Suspense } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const language = await getLanguage();
    const events = await getEvents();
    return { session, language, events };
  },
} satisfies RouteDefinition;

export default function EventsListing() {
  const events = createAsync(() => getEvents());

  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-row items-center gap-4 justify-between">
        <h1 class="text-2xl font-bold">Events</h1>
        <div class="flex flex-row items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            class="flex flex-row items-center gap-2"
            onClick={async () => {
              await revalidate([getEvents.key]);
            }}
          >
            <span>Refresh</span>
            <RefreshCcw class="size-4" />
          </Button>
          <Button size="sm" class="flex flex-row items-center gap-2" as={A} href="/dashboard/events/create">
            <Plus class="size-4" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
      <Suspense
        fallback={
          <div class="w-full aspect-video bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center  border border-neutral-200 dark:border-neutral-900 rounded-xl overflow-clip">
            <span>Loading...</span>
          </div>
        }
      >
        <Show when={events() && events()}>{(es) => <RealtimeEventsList eventsList={es} />}</Show>
      </Suspense>
    </div>
  );
}
