import { Company } from "@/components/Company";
import { getCompanyById } from "@/lib/api/companies";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, RouteSectionProps } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import { Show } from "solid-js";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const company = await getCompanyById(props.params.cid);
    const allRegions = await getAllRegions();
    return { session, company };
  },
} satisfies RouteDefinition;

export const CompanyPage = (props: RouteSectionProps) => {
  const session = createAsync(() => getAuthenticatedSession());
  const company = createAsync(() => getCompanyById(props.params.cid));
  const allRegions = createAsync(() => getAllRegions());

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-6">
            <div class="flex flex-col w-full items-center justify-center gap-6">
              <Show when={company()}>
                {(c) => <Company comp={c()} regionsAmount={allRegions()?.length ?? 0} user={s().user} />}
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
};
