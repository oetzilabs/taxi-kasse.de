import { Organization } from "@/components/Organization";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import Plus from "lucide-solid/icons/plus";
import { For, Show, Suspense } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const regions = await getAllRegions();
    return { session, regions };
  },
} satisfies RouteDefinition;

export default function OrganizationsPage() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const regions = createAsync(() => getAllRegions());

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session() && session()}>
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
                <Show when={regions() && regions()}>
                  {(rs) => (
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
                      {(org) => <Organization org={org} regionsAmount={rs().length} user={s().user} />}
                    </For>
                  )}
                </Show>
              </Suspense>
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
