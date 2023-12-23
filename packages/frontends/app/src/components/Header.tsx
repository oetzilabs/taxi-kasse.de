import { Accessor, Setter, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { cn } from "../utils/cn";
import { Breadcrumbs, DropdownMenu, Popover } from "@kobalte/core";
import { A } from "@solidjs/router";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { useAuth, useAuthUrl } from "./Auth";
import { useBreadcrumbs } from "./Breadcrumbs";
import { useTitle } from "./Title";
import { useNavigate } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";
import { Transition } from "solid-transition-group";
import { useTheme } from "./theme";
import { useWS } from "./WebSocket";

const HeaderStore = createStore({
  visible: () => true,
  setVisible: () => {},
  height: () => 0,
} as {
  visible: Accessor<boolean>;
  setVisible: Setter<boolean>;
  height: Accessor<number>;
});

export const Header = () => {
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

  const navigation = useNavigate();
  const [visible, setVisible] = createSignal(true);
  const [height, setHeight] = createSignal(0);

  createEffect(() => {
    setHeight(document.querySelector("nav")?.clientHeight ?? 0);
  });

  const [theme, setTheme] = useTheme();

  const notifications = useWS();
  const [notificationPage, setNotificationPage] = createSignal(0);

  const missedNotifications = () => {
    const nQ = notifications.queue();
    if (!nQ) {
      return [];
    }
    const filtered = nQ.filter((n) => n.dismissedAt === null);
    return filtered;
  };

  return (
    <nav
      class={cn(
        "flex items-center sticky top-0 z-50 justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 w-full",
        {
          "hidden !h-0": !visible(),
        }
      )}
    >
      <div class="flex items-center justify-between flex-wrap w-full mx-auto p-8">
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
              <Switch
                fallback={<div class="animate-pulse w-24 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-md"></div>}
              >
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
                    <A
                      href="/dashboard/map"
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
                          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                          <line x1="9" x2="9" y1="3" y2="18" />
                          <line x1="15" x2="15" y1="6" y2="21" />
                        </svg>
                      </div>
                      <div class="text-center text-xs font-medium items-center flex">Map</div>
                    </A>
                  </>
                </Match>
              </Switch>
            </div>
            <div class="w-max flex items-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  class="p-2 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-full border border-neutral-200 dark:border-neutral-800"
                  onClick={() => {
                    setTheme(theme() === "dark" ? "light" : "dark");
                  }}
                >
                  <Switch
                    fallback={
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
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    }
                  >
                    <Match when={theme() === "dark"}>
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
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    </Match>
                  </Switch>
                </button>
                <Suspense
                  fallback={
                    <div class="flex items-center p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full border border-neutral-300 dark:border-neutral-700 animate-pulse">
                      <div class="w-[14px] h-[14px]"></div>
                    </div>
                  }
                >
                  <div>
                    <Popover.Root placement="bottom-end">
                      <Popover.Trigger
                        class="flex items-center p-2 bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={missedNotifications().length === 0}
                      >
                        <Switch
                          fallback={
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
                          }
                        >
                          <Match when={missedNotifications().length === 0}>
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
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                          </Match>
                          <Match
                            when={
                              missedNotifications()[notificationPage()] && missedNotifications()[notificationPage()]
                            }
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
                              <path d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                              <circle cx="18" cy="8" r="3" />
                            </svg>
                          </Match>
                        </Switch>
                      </Popover.Trigger>
                      <Popover.Anchor />
                      <Popover.Portal>
                        <Popover.Content class="text-sm z-50 self-end mt-2 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                          <Transition name="slide-fade-horizontal">
                            <Show
                              when={
                                missedNotifications()[notificationPage()] && missedNotifications()[notificationPage()]
                              }
                            >
                              {(n) => (
                                <div class="flex flex-col items-start w-max">
                                  <div class="p-4 flex flex-col items-start w-full gap-4">
                                    <div class="flex flex-row items-center justify-between w-full">
                                      <div class="flex flex-col items-start">
                                        <div class="flex flex-row items-center gap-2">
                                          <Switch>
                                            <Match when={n().type.includes("info")}>
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
                                                <path d="M12 16v-4" />
                                                <path d="M12 8h.01" />
                                              </svg>
                                            </Match>
                                            <Match when={n().type.includes("warning")}>
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
                                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                                <path d="M12 9v4" />
                                                <path d="M12 17h.01" />
                                              </svg>
                                            </Match>
                                          </Switch>
                                          <Popover.Title>{n().title}</Popover.Title>
                                        </div>
                                        <div class="text-[10px] text-neutral-500">ID: {n().id}</div>
                                      </div>
                                      <Popover.CloseButton>
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
                                          <path d="M18 6 6 18" />
                                          <path d="m6 6 12 12" />
                                        </svg>
                                      </Popover.CloseButton>
                                    </div>
                                    <Popover.Description class="text-sm max-w-[300px]">
                                      {n().content}
                                    </Popover.Description>
                                    <button
                                      class="flex flex-row gap-2 items-center rounded-md px-2 py-1 text-xs bg-black dark:bg-white text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={notifications.isDimissing()}
                                      onClick={() => notifications.dismiss(n().id)}
                                    >
                                      <Show when={notifications.isDimissing()}>
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
                                      </Show>
                                      Dismiss
                                    </button>
                                  </div>
                                  <div class="flex flex-row items-center justify-between w-full border-t border-neutral-300 dark:border-neutral-800 px-4 py-2">
                                    <div class="flex flex-row gap-2 w-full">
                                      <button
                                        class="flex flex-row gap-2 items-center rounded-md border border-neutral-300 dark:border-neutral-800 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-400 dark:text-neutral-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={notifications.isDimissingAll()}
                                        onClick={() => notifications.dismissAll()}
                                      >
                                        <Show when={notifications.isDimissingAll()}>
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
                                        </Show>
                                        Dismiss all
                                      </button>
                                    </div>
                                    <div class="flex flex-row w-max gap-2 items-center">
                                      <div class="flex flex-row items-center border border-neutral-300 dark:border-neutral-800 rounded-md">
                                        <button
                                          class="flex flex-row items-center p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                          disabled={notificationPage() === 0}
                                          onClick={() => setNotificationPage((p) => p - 1)}
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
                                            <path d="m15 18-6-6 6-6" />
                                          </svg>
                                        </button>
                                        <button
                                          class="flex flex-row items-center p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                          disabled={notificationPage() === missedNotifications().length - 1}
                                          onClick={() => setNotificationPage((p) => p + 1)}
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
                                            <path d="m9 18 6-6-6-6" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Show>
                          </Transition>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                </Suspense>
                <Suspense
                  fallback={
                    <div class="flex items-center p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full border border-neutral-300 dark:border-neutral-700 animate-pulse">
                      <div class="w-[14px] h-[14px]"></div>
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
                          <div class="p-2 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-full border border-neutral-200 dark:border-neutral-800">
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
                        </Match>
                      </Switch>
                    }
                  >
                    <Match when={auth.isAuthenticated && auth.user}>
                      {(user) => (
                        <div class="flex flex-row items-center gap-4">
                          <DropdownMenu.Root placement="bottom-end">
                            <DropdownMenu.Trigger>
                              <div class="flex w-max flex-row items-center gap-2 cursor-pointer">
                                <img
                                  class="w-7 h-7 rounded-full border border-neutral-500"
                                  src={user().profile.image}
                                  alt={user().name}
                                />
                                <span class="text-sm invisible md:visible">{user().name}</span>
                              </div>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content class="text-sm z-50 self-end mt-2 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                                <DropdownMenu.Group>
                                  <DropdownMenu.GroupLabel class="font-semibold p-2 select-none">
                                    User
                                  </DropdownMenu.GroupLabel>
                                  <DropdownMenu.Item
                                    class={cn(itemClass, "select-none")}
                                    onSelect={() => {
                                      navigation("/profile");
                                    }}
                                  >
                                    <div class="flex flex-row items-center justify-start gap-2 w-full h-full">
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
                                    </div>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    class={cn(itemClass, "select-none")}
                                    onSelect={() => {
                                      navigation("/profile/settings");
                                    }}
                                  >
                                    <div class="flex flex-row items-center justify-start gap-2 w-full h-full">
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
                                    </div>
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
                        </div>
                      )}
                    </Match>
                  </Switch>
                </Suspense>
              </div>
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
              <Match when={!ts.isLoading && ts.value}>
                {(title) => <div class="text-2xl font-medium">{title()}</div>}
              </Match>
              <Match when={ts.isLoading}>
                <div class="animate-pulse w-36 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg"></div>
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const useHeader = () => {
  return HeaderStore;
};
