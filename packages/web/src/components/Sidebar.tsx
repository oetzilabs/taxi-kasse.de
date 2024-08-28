import { createAsync } from "@solidjs/router";
import Bell from "lucide-solid/icons/bell";
import Car from "lucide-solid/icons/car";
import Home from "lucide-solid/icons/home";
import MessageSquare from "lucide-solid/icons/message-square";
import Settings from "lucide-solid/icons/settings";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import Truck from "lucide-solid/icons/truck";
import { Show } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import NavLink from "./NavLink";
import { Separator } from "./ui/separator";

export default function Sidebar() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <div class="flex flex-col w-max grow">
      <div class="flex flex-col gap-0 w-max h-full">
        <Show when={session() && session()!.user !== null}>
          {(s) => (
            <div class="flex flex-col gap-0 w-max h-full">
              <aside class="flex flex-col min-w-48 p-4 pl-0 grow">
                <nav class="flex flex-col grow">
                  <ul class="flex flex-col gap-2 h-full">
                    <li>
                      <NavLink
                        href="/dashboard"
                        class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                        activeClass="bg-neutral-200 dark:bg-neutral-700"
                      >
                        <Home class="size-4" />
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        href="/rides"
                        class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                        activeClass="bg-neutral-200 dark:bg-neutral-700"
                      >
                        <Car class="size-4" />
                        Rides
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        href="/messages"
                        class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                        activeClass="bg-neutral-200 dark:bg-neutral-700"
                      >
                        <MessageSquare class="size-4" />
                        Messages
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        href="/vehicles"
                        class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                        activeClass="bg-neutral-200 dark:bg-neutral-700"
                      >
                        <Truck class="size-4" />
                        Vehicles
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        href="/settings"
                        class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                        activeClass="bg-neutral-200 dark:bg-neutral-700"
                      >
                        <Settings class="size-4" />
                        Settings
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </aside>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
