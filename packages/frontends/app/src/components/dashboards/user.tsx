import { useQueryClient, createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { createSignal, Show, Switch, Match } from "solid-js";
import { Queries } from "../../utils/api/queries";
import { useAuth } from "../Auth";
import { A } from "@solidjs/router";

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

export function UserDashboard() {
  const [auth] = useAuth();

  const company = createQuery(() => ({
    queryKey: ["company"],
    queryFn: () => {
      const token = auth.token;
      if (!token) return Promise.reject("You are not logged in");
      return Queries.company(token);
    },
    get enabled() {
      const token = auth.token;
      return token !== null;
    },
  }));

  return (
    <Switch
      fallback={
        <div class="flex flex-col gap-4 items-center p-0 md:p-4 md:py-10 h-full">
          <div class="w-full md:w-auto h-full md:h-auto relative flex flex-col gap-6 items-center justify-center bg-neutral-50/50 p-16 px-28 dark:bg-black border-0 md:border border-neutral-200 dark:border-neutral-800 rounded-md md:shadow-sm shadow-none select-none">
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
            <div class="flex flex-col gap-4 items-center">
              <div class="text-sm font-medium">You need to be logged in to access this page.</div>
              <div class="text-sm opacity-30">If you don't have an account, you can create one for free.</div>
            </div>
            <div class="text-md font-medium pt-4 gap-4 flex flex-row">
              <A href="/" class="text-sm bg-neutral-200 dark:bg-neutral-900 px-4 py-2 rounded-md shadow-sm">
                Go Home
              </A>
              <A href="/login" class="text-sm text-white bg-blue-900 px-4 py-2 rounded-md shadow-sm">
                Sign in
              </A>
            </div>
          </div>
        </div>
      }
    >
      <Match when={!auth.isLoading && auth.isAuthenticated}>
        <Show
          when={!company.isLoading && company.isSuccess && company.data.company}
          fallback={
            <div class="relative flex flex-col">
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
                <Match when={company.isLoading || company.isFetching}>
                  <div class="flex flex-col gap-4 w-full h-full items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
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
      </Match>
      <Match when={auth.isLoading}>
        <div class="w-full h-full flex items-center justify-center">
          <div class="flex flex-row gap-2 items-center justify-center text-neutral-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span class="text-sm">Loading</span>
          </div>
        </div>
      </Match>
    </Switch>
  );
}
