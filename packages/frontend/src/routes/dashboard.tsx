import { A } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { Match, Show, Switch, createSignal } from "solid-js";
import { useAuth } from "../components/Auth";
import { Queries } from "../utils/api/queries";

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

function UserDashboard(props: UserDashboardProps) {
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
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-4">
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
          </div>
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

export default function Dashboard() {
  const [user] = useAuth();
  return (
    <Show
      when={!user().isLoading && user().isAuthenticated && user()}
      fallback={
        <div class="flex flex-col gap-4 items-center justify-center p-4 h-full">
          <div class="relative flex flex-col gap-6 items-center justify-center bg-neutral-50/50 p-16 px-28 dark:bg-transparent border border-neutral-200 dark:border-neutral-950 rounded-md shadow-sm">
            <div class="text-neutral-300 dark:text-neutral-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
                <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M2 16h.01" />
                <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
              </svg>
            </div>
            <div class="text-xl font-bold">Seems like you're not logged in</div>
            <div class="flex flex-col gap-3 items-center">
              <div class="text-sm font-medium">You need to be logged in to access this page.</div>
              <div class="text-sm">If you don't have an account, you can create one for free.</div>
            </div>
            <div class="text-md font-medium pt-4">
              <A href="/login" class="text-sm text-white bg-blue-500 px-4 py-2 rounded-md shadow-sm">
                Sign in
              </A>
            </div>
          </div>
        </div>
      }
    >
      {(user) => <UserDashboard user={user().user!} token={user().token!} />}
    </Show>
  );
}
