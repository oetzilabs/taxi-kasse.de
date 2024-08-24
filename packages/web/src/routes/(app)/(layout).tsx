import { A, RouteSectionProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "~/lib/utils";
import { Car, Home, MessageSquare } from "lucide-solid";
import { For, JSX, Show } from "solid-js";
import { headerMenu } from "../../components/stores/headermenu";

export default function DashboardLayout(props: RouteSectionProps) {
  const location = useLocation();
  const path = useResolvedPath(() => location.pathname);

  const menu: Record<string, JSX.Element> = {
    dashboard: <Home class="size-4" />,
    rides: <Car class="size-4" />,
    messages: <MessageSquare class="size-4" />,
  };

  return (
    <div class="flex flex-col gap-0 w-full grow">
      <Show when={headerMenu.enabled}>
        <div class="flex flex-row gap-0 border-r border-neutral-200 dark:border-neutral-800 w-full border-b">
          <div class="flex flex-row items-start gap-2 w-max">
            <For each={headerMenu.list}>
              {(linkItem) => (
                <A
                  href={linkItem.href}
                  data-active={path() === linkItem.href}
                  class="flex flex-row items-center justify-start gap-4 border-b-2 border-transparent data-[active=true]:border-neutral-900 data-[active=true]:dark:border-neutral-100 p-4 w-full"
                >
                  {menu[linkItem.value]}
                  <span class="text-sm font-bold">{linkItem.label}</span>
                </A>
              )}
            </For>
          </div>
        </div>
      </Show>
      <div class="flex flex-col gap-0 w-full grow">{props.children}</div>
    </div>
  );
}
