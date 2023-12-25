import { Breadcrumbs } from "@kobalte/core";
import { A } from "@solidjs/router";
import { For, Match, Show, Switch } from "solid-js";
import { useNavigate } from "solid-start";
import { useBreadcrumbs } from "./Breadcrumbs";
import { useTitle } from "./Title";

export const UserMenu = () => {
  const ts = useTitle();
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";

  const bcs = useBreadcrumbs();

  const navigation = useNavigate();

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
        </div>
        <div class="w-max flex items-center"></div>
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
