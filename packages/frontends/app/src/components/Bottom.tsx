import { QueryClient } from "@tanstack/solid-query";
import { Switch, Match, createSignal, For } from "solid-js";
import { useIsRouting } from "solid-start";
import { useWS } from "./WebSocket";
import { cn } from "../utils/cn";
import { HoverCard } from "@kobalte/core";
import { Transition, TransitionGroup } from "solid-transition-group";

export const [fixedBottom, setFixedBottom] = createSignal(false);
export const [stretchedBottom, setStretchedBottom] = createSignal(true);

export const Bottom = (props: { queryClient: QueryClient; buildVersion: string }) => {
  const isRouting = useIsRouting();
  const ws = useWS();
  return (
    <div
      class={cn(
        "w-full h-10 border-t border-neutral-200 dark:border-neutral-800 items-center gap-2.5 inline-flex text-neutral-700 ",
        {
          "z-50 bg-white dark:bg-black fixed bottom-0": fixedBottom(),
        }
      )}
    >
      <div
        class={cn("inline-flex px-1 items-center flex-row", {
          "w-full": stretchedBottom(),
          "container mx-auto px-4 md:px-0": !stretchedBottom(),
        })}
      >
        <div class="justify-center items-end gap-2.5 flex">
          <div class="justify-center items-center gap-1 flex">
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
              class="lucide lucide-info"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div class="text-center text-neutral-600 text-xs font-medium select-none">
              Build Version: {props.buildVersion}
            </div>
          </div>
        </div>
        <div class="grow shrink basis-0 h-6"></div>
        <div class="flex flex-row items-center gap-2">
          <div class="justify-center items-end gap-2.5 flex">
            <HoverCard.Root>
              <HoverCard.Trigger>
                <div
                  class={cn("py-1 rounded-md justify-center items-center gap-1 flex", {
                    "text-emerald-500": ws.status() === "connected",
                  })}
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
                        class="lucide lucide-check-check"
                      >
                        <path d="M18 6 7 17l-5-5" />
                        <path d="m22 10-7.5 7.5L13 16" />
                      </svg>
                    }
                  >
                    <Match when={ws.status() === "connecting"}>
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
                    </Match>
                  </Switch>
                  <div class="text-center text-xs font-medium select-none">
                    <Switch fallback={<span>Connected</span>}>
                      <Match when={ws.status() == "disconnected"}>
                        <span>Disconnected</span>
                      </Match>
                      <Match when={ws.status() == "connecting"}>
                        <span>Connecting</span>
                      </Match>
                    </Switch>
                  </div>
                </div>
              </HoverCard.Trigger>
              <HoverCard.Portal>
                <Transition name="slide-fade">
                  <HoverCard.Content class="z-50 p-4 flex flex-col gap-4 items-center justify-center rounded-md bg-white dark:bg-black shadow-md border border-neutral-200 dark:border-neutral-800">
                    <div class="w-full text-sm font-medium text-neutral-600 dark:text-neutral-400">WebSocket</div>
                    <div class="w-full flex flex-col gap-2">
                      <span class="text-sm font-medium">Statistics</span>
                      <div class="w-full flex flex-col text-xs">
                        <div
                          class={cn({
                            "text-emerald-500": ws.statistics().stream < 140,
                            "text-orange-500": ws.statistics().stream >= 140 && ws.statistics().stream < 200,
                            "text-rose-500": ws.statistics().stream >= 200,
                          })}
                        >
                          <div class="flex flex-row gap-4 items-center justify-between ">
                            <span>Up-/Downstream</span>
                            <span>{ws.statistics().stream} ms</span>
                          </div>
                        </div>
                        <div class="text-rose-500">
                          <div class="flex flex-row gap-4 items-center justify-between">
                            <span>Failed</span>
                            <span>{ws.statistics().failed} msg</span>
                          </div>
                        </div>
                      </div>
                      {/* <TransitionGroup name="slide-fade">
                        <For
                          each={ws.queue()}
                          fallback={
                            <div class="w-full tex-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              No messages
                            </div>
                          }
                        >
                          {(x) => (
                            <Transition name="slide-fade">
                              <div class="max-w-[300px] w-full text-xs font-medium text-neutral-600 dark:text-neutral-400 overflow-clip rounded-sm border border-neutral-300 dark:border-neutral-800 p-4">
                                {JSON.stringify(x)}
                              </div>
                            </Transition>
                          )}
                        </For>
                      </TransitionGroup> */}
                    </div>
                  </HoverCard.Content>
                </Transition>
              </HoverCard.Portal>
            </HoverCard.Root>
          </div>
          <div class="justify-center items-end gap-2.5 flex">
            <div class="py-1 rounded-md justify-center items-center gap-1 flex">
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
                    class="lucide lucide-check-check"
                  >
                    <path d="M18 6 7 17l-5-5" />
                    <path d="m22 10-7.5 7.5L13 16" />
                  </svg>
                }
              >
                <Match when={props.queryClient.isFetching() || props.queryClient.isMutating() || isRouting()}>
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
                </Match>
              </Switch>
              <div class="text-center text-xs font-medium select-none">
                <Switch fallback="Updated">
                  <Match when={props.queryClient.isFetching()}>Updating...</Match>
                  <Match when={props.queryClient.isMutating()}>Syncing...</Match>
                  <Match when={isRouting()}>Routing...</Match>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
