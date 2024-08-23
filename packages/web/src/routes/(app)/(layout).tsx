import { A, RouteSectionProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "~/lib/utils";
import { Car, Home } from "lucide-solid";
import { For, JSX } from "solid-js";

const sidebarMEnu = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <Home class="size-4" />,
  },
  {
    href: "/dashboard/rides",
    label: "Rides",
    icon: <Car class="size-4" />,
  },
];

export default function DashboardLayout(props: RouteSectionProps) {
  const location = useLocation();
  const path = useResolvedPath(() => location.pathname);

  return (
    <div class="flex flex-row gap-0 grow">
      <div class="flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 p-2 w-[200px]">
        <div class="flex flex-col items-start gap-2 w-full">
          <For each={sidebarMEnu}>
            {(linkItem) => (
              <A
                href={linkItem.href}
                data-active={path() === linkItem.href}
                class={cn(
                  "flex flex-row items-center justify-start gap-4 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 data-[active=true]:hover:bg-neutral-200 data-[active=true]:dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-800 py-2 px-4 rounded-lg w-full ",
                  {
                    "bg-neutral-200 dark:bg-neutral-800": path() === linkItem.href,
                  }
                )}
              >
                {linkItem.icon}
                <span>{linkItem.label}</span>
              </A>
            )}
          </For>
        </div>
      </div>
      <div class="flex flex-col gap-0 w-[calc(100vw-200px)]">{props.children}</div>
    </div>
  );
}
