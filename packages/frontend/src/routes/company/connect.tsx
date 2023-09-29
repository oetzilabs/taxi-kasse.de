import { A, redirect } from "solid-start";
import { useAuth } from "../../components/Auth";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { z } from "zod";
import { API } from "../../utils/api";
import { debounce } from "@solid-primitives/scheduled";

// TODO: Add connect page
// This page should be used to connect or create a company.
// If the user is not logged in, redirect to the login page

const getCompanyData = z.function(z.tuple([z.string()])).implement(async (token) => API.hasCompany(token));

export default function ConnectPage() {
  const [user] = useAuth();
  const [hasCompany, setHasCompany] = createSignal<
    | {
        loading: true;
        result: undefined;
      }
    | {
        loading: false;
        result: Awaited<ReturnType<typeof getCompanyData>>;
      }
  >({
    loading: true,
    result: undefined,
  });
  const [searchQuery, setSearchQuery] = createSignal("");
  const searchTrigger = debounce(setSearchQuery, 500);

  const [searchResults, setSearchResults] = createSignal<Awaited<ReturnType<typeof API.searchCompany>>>({
    success: true,
    companies: [],
  });

  const searchCompany = z.function(z.tuple([z.string()])).implement(async (query) => API.searchCompany(query));

  createEffect(async () => {
    if (!user()) {
      redirect("/login");
    }
    if (!user().isLoading && user().isAuthenticated) {
      const x = await getCompanyData(user().token!);
      setHasCompany({
        loading: false,
        result: x,
      });
    }
  });

  createEffect(async () => {
    if (searchQuery().length > 0) {
      const x = await searchCompany(searchQuery());
      setSearchResults(x);
    }
  });

  createEffect(() => {
    console.log(searchResults());
  });

  return (
    <main class="container mx-auto p-4">
      <Show
        when={!hasCompany().loading && hasCompany().result}
        fallback={
          // skeleton
          <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
              <div class="h-8 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-32"></div>
              <div class="space-y-2">
                <div class="h-4 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-2/6"></div>
              </div>
              <div class="space-y-2">
                <div class="flex w-full items-center justify-center rounded-sm bg-neutral-200 dark:bg-neutral-900 p-10" />
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-20"></div>
              </div>
            </div>
          </div>
        }
      >
        {(r) => (
          <Show when={r().success && r() && !r().hasCompany}>
            {(s) => (
              <div class="flex flex-col gap-4">
                <h1 class="text-4xl font-bold">Connect</h1>
                <p class="text-md">You are not connected to a company yet.</p>
                <div class="flex flex-col w-full items-start bg-neutral-100 dark:bg-neutral-900 py-4 px-4 gap-2 border border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <div class="text-neutral-700 dark:text-neutral-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                      <path d="M10 6h4" />
                      <path d="M10 10h4" />
                      <path d="M10 14h4" />
                      <path d="M10 18h4" />
                    </svg>
                  </div>
                  <div class="text-neutral-700 dark:text-neutral-300">
                    If you wish to create a company,{" "}
                    <A class="hover:underline text-blue-500 font-medium" href="/company/create">
                      click here
                    </A>
                    .
                  </div>
                </div>
                <div class="flex flex-col w-full gap-2">
                  <input
                    autofocus
                    type="text"
                    class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                    placeholder="Company Name"
                    value={searchQuery()}
                    onInput={(e) => searchTrigger(e.currentTarget.value)}
                  />
                  <div class="flex flex-col bg-neutral-100 dark:bg-neutral-900">
                    <Switch fallback={<div class="flex p-2">Not Found</div>}>
                      <Match when={searchResults() && searchResults().success && searchResults()}>
                        {(r) => (
                          <For each={r().companies}>
                            {(result) => (
                              <div class="flex flex-row w-full items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
                                <div class="flex flex-col">
                                  <div class="text-lg font-bold">{result.name}</div>
                                  <div class="text-sm text-neutral-500 dark:text-neutral-400">{result.id}</div>
                                </div>
                                <div class="flex flex-row gap-2">
                                  <A
                                    href={`/company/${result.id}`}
                                    class="flex flex-row gap-2 items-center bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-100 dark:focus:ring-neutral-900"
                                  >
                                    View
                                  </A>
                                </div>
                              </div>
                            )}
                          </For>
                        )}
                      </Match>
                    </Switch>
                  </div>
                </div>
                <div class="flex w-full">
                  <A
                    href="/company"
                    class="flex flex-row gap-2 items-center bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-100 dark:focus:ring-neutral-900"
                  >
                    Back
                  </A>
                </div>
              </div>
            )}
          </Show>
        )}
      </Show>
    </main>
  );
}
