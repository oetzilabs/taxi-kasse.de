import { Breadcrumbs, DropdownMenu } from "@kobalte/core";
import { A } from "@solidjs/router";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { cn } from "../utils/cn";
import { useAuth, useAuthUrl } from "./Auth";
import { useBreadcrumbs } from "./Breadcrumbs";
import { useTitle } from "./Title";

export const UserMenu = () => {
  const [auth, setAuthStore] = useAuth();
  const ts = useTitle();
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";

  const signOut = () => {
    // remove cookie
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setAuthStore({
      isLoading: false,
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };

  const authUrl = useAuthUrl();
  const bcs = useBreadcrumbs();

  return (
    <div class="w-full h-auto flex-col justify-start items-start gap-2 inline-flex">
      <div class="w-full self-stretch justify-between items-center gap-1 inline-flex">
        <div class="w-full justify-start items-center gap-2 inline-flex">
          <A
            href="/"
            class="px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-400 justify-start items-center gap-1 flex select-none"
          >
            <div class="relative">
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
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div class="text-center text-xs font-medium items-center flex">Home</div>
          </A>
          <Switch fallback={<div class="animate-pulse w-24 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-md"></div>}>
            <Match when={auth.isAuthenticated}>
              <>
                <A
                  href="/dashboard"
                  class="px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-400 justify-start items-center gap-1 flex select-none"
                >
                  <div class="relative">
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
                      <rect width="7" height="9" x="3" y="3" rx="1" />
                      <rect width="7" height="5" x="14" y="3" rx="1" />
                      <rect width="7" height="9" x="14" y="12" rx="1" />
                      <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                  </div>
                  <div class="text-center text-xs font-medium items-center flex">Dashboard</div>
                </A>
              </>
            </Match>
          </Switch>
        </div>
        <div class="w-max">
          <Suspense
            fallback={
              <div class="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
            }
          >
            <Switch
              fallback={
                <Switch
                  fallback={
                    <A href={`${import.meta.env.VITE_AUTH_URL}/authorize?${authUrl.toString()}`} rel="noreferrer">
                      <div class="py-1 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 w-max flex flex-row items-center justify-start gap-2 border border-neutral-200 dark:border-neutral-800 select-none shadow-sm">
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
                          class="lucide lucide-log-in"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                        <span class="text-xs font-medium">Sign in</span>
                      </div>
                    </A>
                  }
                >
                  <Match when={auth.isLoading}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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
                  </Match>
                </Switch>
              }
            >
              <Match when={auth.isAuthenticated && auth.user}>
                {(user) => (
                  <DropdownMenu.Root placement="bottom-end">
                    <DropdownMenu.Trigger>
                      <div class="flex w-max flex-row items-center gap-2 cursor-pointer">
                        <img class="w-7 h-7 rounded-full" src={user().profile.image} alt={user().name} />
                        <span class="text-sm">{user().name}</span>
                      </div>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content class="text-sm z-50 self-end mt-3 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                        <DropdownMenu.Group>
                          <DropdownMenu.GroupLabel class="font-semibold p-2 select-none">User</DropdownMenu.GroupLabel>
                          <DropdownMenu.Item class={cn(itemClass, "select-none")}>
                            <A href="/profile" class="flex flex-row items-center justify-start gap-2 w-full h-full">
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
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="10" r="3" />
                                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                              </svg>
                              <span>Profile</span>
                            </A>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item class={cn(itemClass, "select-none")}>
                            <A
                              href="/profile/settings"
                              class="flex flex-row items-center justify-start gap-2 w-full h-full"
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
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Settings</span>
                            </A>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator class="border-neutral-200 dark:border-neutral-800" />
                          <DropdownMenu.Item
                            class={cn(
                              itemClass,
                              "select-none text-red-500 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950 dark:active:bg-red-900 dark:hover:text-white dark:active:text-white"
                            )}
                            onSelect={signOut}
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
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" x2="9" y1="12" y2="12" />
                            </svg>
                            <span>Logout</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </Match>
            </Switch>
          </Suspense>
        </div>
      </div>
      <Switch>
        <Match when={!bcs.isLoading && bcs.breadcrumbs.length > 0}>
          <div class="justify-start items-start gap-1 inline-flex text-neutral-700">
            <Breadcrumbs.Root class="w-auto h-auto justify-start items-start gap-1 inline-flex text-xs select-none">
              <For each={bcs.breadcrumbs}>
                {(breadcrumb, index) => (
                  <>
                    <Breadcrumbs.Link as={A} href={breadcrumb.href} class="font-bold">
                      {breadcrumb.label}
                    </Breadcrumbs.Link>
                    <Show when={index() !== bcs.breadcrumbs.length - 1}>
                      <Breadcrumbs.Separator class="text-neutral-400 dark:text-neutral-600" />
                    </Show>
                  </>
                )}
              </For>
            </Breadcrumbs.Root>
          </div>
        </Match>
        <Match when={bcs.isLoading}>
          <div class="animate-pulse w-24 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-md"></div>
        </Match>
      </Switch>
      <div class="justify-start items-start inline-flex">
        <Switch>
          <Match when={!ts.isLoading && ts.value}>{(title) => <div class="text-2xl font-medium">{title()}</div>}</Match>
          <Match when={ts.isLoading}>
            <div class="animate-pulse w-36 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg"></div>
          </Match>
        </Switch>
      </div>
    </div>
  );
};