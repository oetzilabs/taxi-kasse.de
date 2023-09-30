import { Show, Suspense, createEffect, createSignal, onMount } from "solid-js";
import { useAuth } from "../components/Auth";
import server$, { createServerData$, redirect } from "solid-start/server";
import { ErrorMessage, RouteDataFuncArgs, useLocation, useNavigate, useRouteData } from "solid-start";
import { API, statistics } from "../utils/api";
import { z } from "zod";
import dayjs from "dayjs";
import { A } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";

// Goal: This is the main page `/`
// If the user is logged in, show a welcome message
// And a little dashboard of the last week's data:
// - Total number of entries on the cab drives
// - Total number of km/miles driven
// - Total number of Cash made (in the currency of the country)
// Use a grid to show the data

// If the user is not logged in, show how the app works
// And a button to login

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
  const stats = createQuery(
    () => ["stats"],
    () => Queries.statistics(props.token, range())
  );
  const company = createQuery(
    () => ["company"],
    () => Queries.company(props.token)
  );
  const queryClient = useQueryClient();

  return (
    <Show
      when={!company.isLoading && company.data?.company && !stats.isLoading && stats.data}
      fallback={
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-4">
            <div class="relative flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 h-[600px] rounded-sm bg-neutral-50 dark:bg-neutral-950 items-center justify-center text-neutral-600 dark:text-neutral-700">
              Loading Dashboard
            </div>
          </div>
        </div>
      }
    >
      {(s) => (
        <div class="flex flex-col w-full gap-4">
          <h1 class="text-2xl font-bold">Welcome {props.user.name}</h1>
          <div class="flex flex-row items-center justify-between w-full">
            <h2 class="text-xl font-bold">Your Dashboard</h2>
            <button
              aria-label="Refresh"
              class="flex flex-row gap-2 items-center bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-100 dark:focus:ring-neutral-900"
              onClick={async () => {
                await queryClient.invalidateQueries(["stats"]);
                await queryClient.invalidateQueries(["company"]);
              }}
            >
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
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              Refresh
            </button>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <Statistics
              value={0}
              label="Total number of entries"
              description="Total number of entries on the cab drives"
              unit="entries"
            />
            <Statistics
              value={0}
              label="Total number of km/miles driven"
              description="Total number of km/miles driven"
              unit="km/miles"
            />
            <Statistics
              value={0}
              label="Total number of Cash made"
              description="Total number of Cash made (in the currency of the country)"
              unit="currency"
            />
          </div>
          <Show when={!company.isLoading && company.data?.company}>
            {(c) => (
              <div class="flex flex-col">
                <A href={`/company/${c().id}`}>
                  <h1 class="text-xl font-bold">Your Company</h1>
                </A>
                <div class="flex flex-row items-center justify-between w-full">
                  <h2 class="text-lg font-bold">{c().name}</h2>
                  <A
                    href={`/company/${c().id}`}
                    class="flex flex-row gap-2 items-center bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-100 dark:focus:ring-neutral-900"
                  >
                    View
                  </A>
                </div>
              </div>
            )}
          </Show>
        </div>
      )}
    </Show>
  );
}

export default function Dashboard() {
  const [user] = useAuth();
  return (
    <div class="flex container mx-auto flex-col gap-4 py-4">
      <Show
        when={!user().isLoading && user().isAuthenticated && user()}
        fallback={
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
              <div class="relative flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 h-[600px] rounded-sm bg-neutral-50 dark:bg-neutral-950 items-center justify-center text-neutral-600 dark:text-neutral-700">
                Loading Dashboard
              </div>
            </div>
          </div>
        }
      >
        {(user) => <UserDashboard user={user().user!} token={user().token!} />}
      </Show>
    </div>
  );
}
