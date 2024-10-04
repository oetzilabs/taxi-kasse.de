import AddRideModal from "@/components/forms/AddRide";
import { RidesList } from "@/components/RidesList";
import { Button } from "@/components/ui/button";
import { getLanguage } from "@/lib/api/application";
import { getRides } from "@/lib/api/rides";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, revalidate, RouteDefinition, useSearchParams } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import { Show, Suspense } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const rides = await getRides();
    return { rides, session };
  },
} satisfies RouteDefinition;

export default function RidesPage() {
  const rides = createAsync(() => getRides());
  const session = createAsync(() => getAuthenticatedSession());
  const [search, setSearchParams] = useSearchParams();

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session() && session()}>
        {(s) => (
          <Show
            when={s().company}
            fallback={
              <div class="flex flex-col w-full py-4 gap-4">
                <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                  <span class="text-sm">You currently have no organizations.</span>
                  <span class="text-sm">
                    Please{" "}
                    <A href="/dashboard/organizations/add" class="hover:underline text-blue-500 font-medium">
                      create/join an organization
                    </A>{" "}
                    to view your dashboard
                  </span>
                </div>
              </div>
            }
          >
            {(c) => (
              <div class="flex flex-col w-full gap-0 grow">
                <div class="flex flex-col w-full py-4 gap-4 grow">
                  <div class="flex flex-col-reverse xl:flex-row w-full gap-4 grow">
                    <div class="gap-0 w-full grow">
                      <div class="flex flex-col gap-2 w-full grow">
                        <div class="flex flex-row items-center justify-between gap-0">
                          <div class="flex flex-row items-center gap-4 w-full">
                            <span class="text-lg font-bold">Rides</span>
                          </div>
                          <div class="flex flex-row items-center gap-2 w-max">
                            <Button
                              size="sm"
                              class="flex flex-row items-center gap-2 select-none size-8 md:size-auto p-2 md:px-3 md:py-2"
                              variant="secondary"
                              onClick={async () => {
                                await revalidate([getRides.key, getLanguage.key]);
                              }}
                            >
                              <span class="sr-only md:not-sr-only">Refresh</span>
                              <RotateClockwise class="size-4" />
                            </Button>
                            <AddRideModal
                              vehicle_id_saved={null}
                              vehicle_id_used_last_time={null}
                              base_charge={Number(c().base_charge)}
                              distance_charge={Number(c().distance_charge)}
                              time_charge={Number(c().time_charge)}
                              currency_code={s().user?.currency_code ?? "USD"}
                            />
                          </div>
                        </div>
                        <Suspense
                          fallback={
                            <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                              <Loader2 class="size-4 animate-spin" />
                            </div>
                          }
                        >
                          <Show when={rides() && rides()}>{(rs) => <RidesList rides={rs()} />}</Show>
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Show>
        )}
      </Show>
    </div>
  );
}
