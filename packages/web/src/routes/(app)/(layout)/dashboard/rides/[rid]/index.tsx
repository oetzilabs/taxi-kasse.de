import { getRide } from "@/lib/api/rides";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, RouteSectionProps } from "@solidjs/router";
import { language } from "~/components/stores/Language";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Show } from "solid-js";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const rid = props.params.rid;
    const ride = await getRide(rid);
    return { ride, session };
  },
  load: async (props) => {
    const session = await getAuthenticatedSession();
    const rid = props.params.rid;
    const ride = await getRide(rid);
    return { ride, session };
  },
} satisfies RouteDefinition;

export default function RideRidPage(props: RouteSectionProps) {
  const session = createAsync(() => getAuthenticatedSession());
  const ride = createAsync(() => getRide(props.params.rid), { deferStream: true });

  const obscureId = (id: string) => {
    const firstSix = id.substring(0, 6);
    const rest = id.substring(6);
    return firstSix + "*".repeat(rest.length);
  };

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
                      <div class="flex flex-col w-full">
                        <span class="text-xs text-muted-foreground">{obscureId(r().id.split("ride_")[1])}</span>
                        <span class="text-sm font-bold">{r().vehicle.name}</span>
                        <span class="text-sm">{r().status}</span>
                      </div>
                      <div class="flex flex-col w-max items-start justify-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger as={Button} size="sm">
                            Menu
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem as={A} href={`/dashboard/rides/${r().id}/edit`}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col p-2 w-full border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <span class="font-bold pb-2 pl-1">Map</span>
                    <div class="flex flex-col w-full bg-neutral-100 dark:bg-neutral-900 min-h-[450px] rounded-lg"></div>
                  </div>
                  <div class="flex flex-col p-2 w-full">
                    <span class="text-xs text-muted-foreground"></span>
                    <span class="text-sm font-bold">
                      {new Intl.NumberFormat(language(), {
                        style: "currency",
                        currency: s().user!.currency_code,
                      }).format(Number(r().income))}
                    </span>
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
