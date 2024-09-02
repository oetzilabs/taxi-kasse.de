import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import { For, Show } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-4 ">
            <div class="flex flex-col w-full items-center justify-center rounded-lg gap-0 border border-neutral-200 dark:border-neutral-800 overflow-clip">
              <For
                each={s().organizations}
                fallback={
                  <div class="flex flex-col w-full pb-4 gap-4">
                    <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
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
                  <div class="flex flex-col gap-2 w-full h-max border-b border-neutral-200 dark:border-neutral-800 last:border-b-0 p-4">
                    <div class="text-lg font-bold">
                      <span>{org.name}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 w-full">
                      <For
                        each={org.regions}
                        fallback={
                          <div class="col-span-full p-4 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-2">
                            <span class="text-sm font-bold text-muted-foreground">No Regions</span>
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
                    <div class="grid grid-cols-3 gap-2 w-full">
                      <For
                        each={org.employees}
                        fallback={
                          <div class="col-span-full p-4 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-2">
                            <span class="text-sm font-bold text-muted-foreground">No Regions</span>
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
              <Show when={s().organizations.length > 0}>
                <A
                  class="w-full p-4 items-center justify-center flex flex-row gap-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  href="/dashboard/organizations/add"
                >
                  <span>Add Organization</span>
                  <Plus class="size-4" />
                </A>
              </Show>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
