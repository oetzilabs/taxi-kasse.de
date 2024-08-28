import { A, createAsync } from "@solidjs/router";
import Car from "lucide-solid/icons/car";
import Home from "lucide-solid/icons/home";
import Map from "lucide-solid/icons/map";
import Menu from "lucide-solid/icons/menu";
import MessageSquare from "lucide-solid/icons/message-square";
import Settings from "lucide-solid/icons/settings";
import Truck from "lucide-solid/icons/truck";
import { Show } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import NavLink from "./NavLink";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Sidebar() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <div class="flex flex-col w-full xl:w-max grow">
      <Show when={session() && session()!.user !== null}>
        {(s) => (
          <nav class="flex flex-col w-full min-w-48 grow">
            <div class="flex flex-row xl:flex-col w-full grow items-center justify-between xl:justify-start gap-2">
              <NavLink
                href="/dashboard"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <Home class="size-4" />
                Dashboard
              </NavLink>
              <NavLink
                href="/rides"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <Car class="size-4" />
                Rides
              </NavLink>
              <NavLink
                href="/messages"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <MessageSquare class="size-4" />
                Messages
              </NavLink>
              <NavLink
                href="/vehicles"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <Truck class="size-4" />
                Vehicles
              </NavLink>
              <NavLink
                href="/regions"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <Map class="size-4" />
                Regions
              </NavLink>
              <NavLink
                href="/settings"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
                activeClass="bg-neutral-200 dark:bg-neutral-700"
              >
                <Settings class="size-4" />
                Settings
              </NavLink>
              <div class="visible xl:invisible w-max h-full">
                <DropdownMenu placement="bottom-end">
                  <DropdownMenuTrigger as={Button} size="icon" class="size-auto p-3.5 rounded-lg">
                    <Menu class="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard">
                      <Home class="size-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/rides">
                      <Car class="size-4" />
                      <span>Rides</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/messages">
                      <MessageSquare class="size-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/vehicles">
                      <Truck class="size-4" />
                      <span>Vehicles</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/settings">
                      <Settings class="size-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>
        )}
      </Show>
    </div>
  );
}
