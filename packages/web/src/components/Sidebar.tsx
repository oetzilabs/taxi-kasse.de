import { A, createAsync } from "@solidjs/router";
import Building2 from "lucide-solid/icons/building-2";
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
    <div class="flex flex-col w-full xl:w-max h-max sticky top-0 z-50 pt-4 bg-background">
      <Show when={session() && session()!.user !== null}>
        {(s) => (
          <nav class="flex flex-col w-full min-w-48 grow">
            <div class="flex flex-row xl:flex-col w-full grow items-center justify-between xl:justify-start gap-2">
              <NavLink
                exact
                href="/dashboard"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <Home class="size-4" />
                Dashboard
              </NavLink>
              <NavLink
                href="/dashboard/rides"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <Car class="size-4" />
                Rides
              </NavLink>
              <NavLink
                href="/dashboard/messages"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <MessageSquare class="size-4" />
                Messages
              </NavLink>
              <NavLink
                href="/dashboard/vehicles"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <Truck class="size-4" />
                Vehicles
              </NavLink>
              <NavLink
                href="/dashboard/regions"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <Map class="size-4" />
                Regions
              </NavLink>
              <NavLink
                href="/dashboard/organizations"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
              >
                <Building2 class="size-4" />
                Organizations
              </NavLink>
              <NavLink
                href="/settings"
                class="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-sm"
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
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/rides">
                      <Car class="size-4" />
                      <span>Rides</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/messages">
                      <MessageSquare class="size-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/vehicles">
                      <Truck class="size-4" />
                      <span>Vehicles</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/regions">
                      <Map class="size-4" />
                      <span>Regions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/organizations">
                      <Building2 class="size-4" />
                      <span>Organizations</span>
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
