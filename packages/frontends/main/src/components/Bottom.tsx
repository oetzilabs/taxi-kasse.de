import { QueryClient } from "@tanstack/solid-query";
import { Switch, Match, createSignal } from "solid-js";
import { useIsRouting } from "solid-start";
import { cn } from "../utils/cn";

export const [fixedBottom, setFixedBottom] = createSignal(false);
export const [stretchedBottom, setStretchedBottom] = createSignal(true);

export const Bottom = (props: { queryClient: QueryClient; buildVersion: string }) => {
  const isRouting = useIsRouting();
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
          <div class="px-1 justify-center items-center gap-1 flex">
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
        <div class="justify-center items-end gap-2.5 flex">
          <div class="p-1 rounded-md justify-center items-center gap-1 flex">
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
  );
};
