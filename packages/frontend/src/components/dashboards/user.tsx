import { useQueryClient, createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { createSignal, Show, Switch, Match } from "solid-js";
import { Queries } from "../../utils/api/queries";
import { useAuth } from "../Auth";

type StatisticsProps = {
  value: number;
  label: string;
  description: string;
  unit: string;
};

const Statistics = (props: StatisticsProps) => {
  return (
    <div class="flex flex-col bg-neutral-100 p-4 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm gap-2">
      <div class="text-2xl font-bold">{props.value}</div>
      <div class="text-xl font-bold">{props.label}</div>
      <div class="text-sm">{props.description}</div>
      <div class="text-sm">{props.unit}</div>
    </div>
  );
};

type UserDashboardProps = {
  user: NonNullable<ReturnType<ReturnType<typeof useAuth>[0]>["user"]>;
  token: string;
};

export function UserDashboard(props: UserDashboardProps) {
  const [range, setRange] = createSignal({
    from: dayjs().startOf("week").toDate(),
    to: dayjs().endOf("week").toDate(),
  });
  const queryClient = useQueryClient();

  const stats = createQuery(() => ({
    queryKey: ["stats", range()],
    queryFn: () => Queries.statistics(props.token, range()),
    get enabled() {
      return props.user.companyId !== null;
    },
  }));

  const company = createQuery(() => ({
    queryKey: ["company"],
    queryFn: () => Queries.company(props.token),
    get enabled() {
      return props.user.companyId !== null;
    },
  }));

  return (
    <Show
      when={
        !company.isLoading &&
        company.isSuccess &&
        company.data.company &&
        !stats.isLoading &&
        stats.isSuccess &&
        stats.data
      }
      fallback={
        <div class="relative flex flex-col">
          <Switch
            fallback={
              <Switch
                fallback={
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-4">
                      <div class="relative flex flex-col">
                        <div class="flex flex-col gap-2">
                          <div class="text-2xl font-bold">Error</div>
                          <div class="text-xl font-bold">Something went wrong</div>
                          <div class="text-sm">An unexpected error occurred, please retry in a few minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <Match when={stats.isError}>
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-4">
                      <div class="relative flex flex-col">
                        <div class="flex flex-col gap-2">
                          <div class="text-2xl font-bold">Error</div>
                          <div class="text-xl font-bold">Something went wrong</div>
                          <div class="text-sm">We were unable to load the statistics</div>
                          <div class="text-xs">
                            <pre>{stats.error?.message}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Match>
              </Switch>
            }
          >
            <Match when={stats.isLoading}>
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4">
                  <div class="relative flex flex-col"></div>
                </div>
              </div>
            </Match>
          </Switch>
        </div>
      }
    >
      {(s) => (
        <>
          <pre class="text-xs">{JSON.stringify(s(), null, 2)}</pre>
        </>
      )}
    </Show>
  );
}
