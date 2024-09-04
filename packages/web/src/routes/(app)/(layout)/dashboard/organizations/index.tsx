import { Button } from "@/components/ui/button";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import { For, Show } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const regions = await getAllRegions();
    return { session, regions };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());
  const regions = createAsync(() => getAllRegions());

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-6">
            <div class="flex flex-col w-full items-center justify-center gap-6">
              <For
                each={s().organizations}
                fallback={
                  <div class="flex flex-col w-full pb-6 gap-4">
                    <div class="flex flex-col w-full items-center justify-center rounded-md px-6 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                      <span class="text-sm">You currently have no organizations.</span>
                      <span class="text-sm">
                        Please{" "}
                        <A href="/dashboard/organizations/add" class="hover:underline text-blue-500 font-medium">
                          create/join an organization
                        </A>{" "}
                        to view your list of organizations.
                      </span>
                    </div>
                  </div>
                }
              >
                {(org) => (
                  <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
                    <div class="flex flex-col p-6 gap-2">
                      <div class="text-lg font-bold leading-none">
                        <span>{org.name}</span>
                      </div>
                      <div class="flex flex-col gap-1 w-full">
                        <span class="text-base font-bold text-muted-foreground">Owner</span>
                        <div class="text-sm">{org.owner.name}</div>
                      </div>
                      <div class="flex flex-col gap-1 w-full">
                        <span class="text-base font-bold text-muted-foreground">Email</span>
                        <div class="text-sm">{org.email}</div>
                      </div>
                      <div class="flex flex-col gap-1 w-full">
                        <span class="text-base font-bold text-muted-foreground">Phone Number</span>
                        <div class="text-sm">{org.phoneNumber}</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-6 w-full p-6 border-t border-neutral-200 dark:border-neutral-800">
                      <div class="col-span-full flex flex-row gap-6 w-full items-center justify-between">
                        <span class="text-base font-bold w-max">Regions</span>
                        <Show when={regions()}>
                          {(rs) => (
                            <span class="text-sm font-medium w-max text-muted-foreground">
                              {org.regions.length}/{rs().length}
                            </span>
                          )}
                        </Show>
                      </div>
                      <For
                        each={org.regions}
                        fallback={
                          <div class="col-span-full p-20 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-4">
                            <span class="text-sm font-bold text-muted-foreground select-none">
                              No Regions in Collection
                            </span>
                            <Button
                              size="sm"
                              class="flex items-center gap-2"
                              onClick={() => {
                                toast.info("Coming Soon");
                              }}
                            >
                              <span>Add Region</span>
                              <Plus class="size-4" />
                            </Button>
                          </div>
                        }
                      >
                        {(r) => (
                          <div class="flex flex-col gap-1 w-full h-max border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                            <div class="text-sm font-bold">{r.region.name}</div>
                          </div>
                        )}
                      </For>
                      <Show when={org.regions.length > 0}>
                        <div
                          class="w-full p-4"
                          onClick={() => {
                            toast.info("Coming Soon");
                          }}
                        >
                          <span>Add Region</span>
                          <Plus class="size-4" />
                        </div>
                      </Show>
                    </div>
                    <div class="grid grid-cols-3 gap-6 w-full p-6 border-t border-neutral-200 dark:border-neutral-800">
                      <span class="text-base font-bold">Employees</span>
                      <For
                        each={org.employees}
                        fallback={
                          <div class="col-span-full p-20 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-4">
                            <span class="text-sm font-bold text-muted-foreground select-none">No Employees</span>
                            <Button
                              size="sm"
                              class="flex items-center gap-2"
                              onClick={() => {
                                toast.info("Coming Soon");
                              }}
                            >
                              <span>Add Employee</span>
                              <Plus class="size-4" />
                            </Button>
                          </div>
                        }
                      >
                        {(employee) => (
                          <div class="flex flex-col gap-1 w-full h-max border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                            <div class="text-sm font-bold">
                              {employee.user.name} ({employee.user.email})
                            </div>
                          </div>
                        )}
                      </For>
                      <Show when={org.employees.length > 0}>
                        <div
                          class="w-full p-4"
                          onClick={() => {
                            toast.info("Coming Soon");
                          }}
                        >
                          <span>Add Employee</span>
                          <Plus class="size-4" />
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <Show when={s().organizations.length > 0}>
              <A
                class="w-full p-4 items-center justify-center flex flex-row gap-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                href="/dashboard/organizations/add"
              >
                <span>Add Organization</span>
                <Plus class="size-4" />
              </A>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
