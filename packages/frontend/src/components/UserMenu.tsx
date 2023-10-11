import { DropdownMenu } from "@kobalte/core";
import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Match, Suspense, Switch, createEffect } from "solid-js";
import { parseCookie } from "solid-start";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import { useAuth } from "./Auth";

export const UserMenu = () => {
  const [AuthStore, setAuthStore] = useAuth();
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";

  const sessionQuery = createQuery(
    () => ["session"],
    () => {
      const _as = AuthStore();
      const token = _as.token;
      if (!token)
        return Promise.resolve({
          success: false as const,
          error: "no token",
        });
      return Queries.session(token);
    },
    {
      get enabled() {
        const _as = AuthStore();
        return _as.token !== null;
      },
      refetchInterval: 1000 * 60 * 5,
    }
  );

  createEffect(() => {
    const isLoading = sessionQuery.isLoading;
    const isAuthenticated = sessionQuery.data?.success && sessionQuery.data?.user ? true : false ?? false;
    let user = null;
    switch (sessionQuery.data?.success ?? false) {
      case true:
        // @ts-ignore
        user = sessionQuery.data?.user;
        break;
      case false:
        user = null;
        break;
      default:
        user = null;
        break;
    }
    const cookie = parseCookie(document.cookie);
    const sessionToken = cookie["session"];

    setAuthStore({
      isLoading,
      isAuthenticated,
      token: sessionToken,
      user,
    });
  });

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

  return (
    <div class="flex w-full flex-row items-center justify-between">
      <div class="flex">
        <A href="/" class="hover:underline">
          Taxi-Kasse
        </A>
      </div>
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
                <A
                  href={`${
                    import.meta.env.VITE_AUTH_URL
                  }/authorize?provider=google&response_type=code&client_id=google&redirect_uri=http://localhost:3000/api/auth/callback`}
                  rel="noreferrer"
                  class="py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  Sign in with Google
                </A>
              }
            >
              <Match when={sessionQuery.isLoading}>
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
          <Match when={AuthStore().isAuthenticated && AuthStore().user}>
            {(user) => (
              <DropdownMenu.Root placement="bottom-end">
                <DropdownMenu.Trigger>
                  <div class="flex w-max flex-row items-center gap-1">
                    <div class="flex items-center text-sm gap-1 cursor-pointer">
                      <img class="w-7 h-7 rounded-full" src={user().profile.image} alt={user().name} />
                      <span class="text-sm">{user().name}</span>
                    </div>
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content class="z-50 self-end mt-3 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                    <DropdownMenu.Group>
                      <DropdownMenu.GroupLabel class="font-semibold p-2 select-none">User</DropdownMenu.GroupLabel>
                      <DropdownMenu.Item class={cn(itemClass, "select-none")}>
                        <A href="/profile" class="flex flex-row items-center justify-start gap-2 w-full h-full">
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
                            width="16"
                            height="16"
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
                          width="16"
                          height="16"
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
  );
};
