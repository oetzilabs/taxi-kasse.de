import { Company } from "@/components/Company";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import { For, Show } from "solid-js";

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
              <Show when={regions()}>
                {(rs) => (
                  <For
                    each={s().companies}
                    fallback={
                      <div class="flex flex-col w-full pb-6 gap-4">
                        <div class="flex flex-col w-full items-center justify-center rounded-md px-6 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                          <span class="text-sm">You currently have no companies.</span>
                          <span class="text-sm">
                            Please{" "}
                            <A href="/dashboard/companies/add" class="hover:underline text-blue-500 font-medium">
                              create/join an company
                            </A>{" "}
                            to view your list of companies.
                          </span>
                        </div>
                      </div>
                    }
                  >
                    {(org) => <Company comp={org} regionsAmount={rs().length} user={s().user} />}
                  </For>
                )}
              </Show>
            </div>
            <Show when={s().companies.length > 0}>
              <A
                class="w-full p-4 items-center justify-center flex flex-row gap-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                href="/dashboard/companies/add"
              >
                <span>Add Company</span>
                <Plus class="size-4" />
              </A>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
