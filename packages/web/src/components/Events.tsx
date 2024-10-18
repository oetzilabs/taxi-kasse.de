import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/api/events";
import { A, createAsync } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import { Show, Suspense } from "solid-js";

export const Events = () => {
  const events = createAsync(() => getEvents());
  return (
    <Button as={A} variant="outline" href="/dashboard/events" class="flex flex-row w-full gap-2 items-center justify-between rounded-lg px-3">
      <span class="font-bold">Events</span>
      <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
        <Show when={events() && events()}>{(es) => <span class="">{es().length}</span>}</Show>
      </Suspense>
    </Button>
  );
};
