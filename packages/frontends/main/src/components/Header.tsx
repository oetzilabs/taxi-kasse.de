import { Breadcrumbs } from "@kobalte/core";
import { A } from "@solidjs/router";
import { Accessor, For, Match, Setter, Show, Switch, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-start";
import { cn } from "../utils/cn";
import { useBreadcrumbs } from "./Breadcrumbs";
import { useTitle } from "./Title";
import { useTheme } from "./theme";

export const [stretchedHeader, setStretchedHeader] = createSignal(false);
export const [visibleHeader, setVisibleHeader] = createSignal(true);

export const Header = () => {
  const ts = useTitle();
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";

  const bcs = useBreadcrumbs();

  const navigation = useNavigate();

  const [theme, setTheme] = useTheme();

  return (
    <nav
      class={cn(
        "flex items-center sticky top-0 z-50 justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 w-full",
        {
          "hidden !h-0": !visibleHeader(),
        }
      )}
    >
      <div
        class={cn(
          "container mx-auto py-8 md:px-0 px-4 flex items-center justify-between flex-wrap transition-[width]",
          {
            "w-full p-8": stretchedHeader(),
          }
        )}
      >
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
