import { Organization } from "@/components/Organization";
import { getOrganizationById } from "@/lib/api/organizations";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, RouteSectionProps } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import Plus from "lucide-solid/icons/plus";
import { Show, Suspense } from "solid-js";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const org = await getOrganizationById(props.params.oid);
    const allRegions = await getAllRegions();
    return { session, org, allRegions };
  },
} satisfies RouteDefinition;

export const CompanyPage = (props: RouteSectionProps) => {
  const session = createAsync(() => getAuthenticatedSession());
  const organization = createAsync(() => getOrganizationById(props.params.oid));
  const allRegions = createAsync(() => getAllRegions());

  return (
    <div class="w-full grow flex flex-col">
      <Suspense
        fallback={
          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <Show when={session() && session()}>
          {(s) => (
            <div class="flex flex-col w-full py-4 gap-6">
              <div class="flex flex-col w-full items-center justify-center gap-6">
                <Show when={organization() && organization()}>
                  {(o) => <Organization org={o()} regionsAmount={allRegions()?.length ?? 0} user={s().user} />}
                </Show>
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
      </Suspense>
    </div>
  );
};

export default CompanyPage;
