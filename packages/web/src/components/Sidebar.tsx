import { A, createAsync, useLocation } from "@solidjs/router";
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

const navigations = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Rides", href: "/dashboard/rides", icon: Car },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { label: "Regions", href: "/dashboard/regions", icon: Map },
  { label: "Central", href: "/dashboard/organizations", icon: Building2 },
  { label: "Companies", href: "/dashboard/companies", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const session = createAsync(() => getAuthenticatedSession());

  const location = useLocation();
  const currentNavigation = () => {
    const current = navigations.find((n) => n.href === location.pathname);
    if (!current) return "Unknown Page";
    return current.label;
  };

  return (
    <div class="flex flex-col w-full h-max bg-neutral-200 dark:bg-neutral-900 shadow-sm">
      <div class="flex flex-row h-max w-full">
        <div class="flex w-full h-[50px] flex-1 border-b-2 border-neutral-300 dark:border-neutral-800"></div>
        <div class="container flex flex-col mx-0 px-0">
          <Show when={session() && session()!.user !== null}>
            {(s) => (
              <nav class="flex flex-col w-full">
                <div class="flex flex-row w-full items-center">
                  <div class="w-8 border-b-2 border-neutral-300 dark:border-neutral-800 h-[50px]" />
                  <div class="hidden xl:flex flex-row items-center gap-0 w-full">
                    <NavLink exact href="/dashboard">
                      {/* <Home class="size-4" /> */}
                      <span class="h-4">Dashboard</span>
                    </NavLink>
                    <NavLink href="/dashboard/rides">
                      {/* <Car class="size-4" /> */}
                      <span class="h-4">Rides</span>
                    </NavLink>
                    <NavLink href="/dashboard/vehicles">
                      {/* <Truck class="size-4" /> */}
                      <span class="h-4">Vehicles</span>
                    </NavLink>
                    <NavLink href="/dashboard/regions">
                      {/* <Map class="size-4" /> */}
                      <span class="h-4">Regions</span>
                    </NavLink>
                    <NavLink href="/dashboard/organizations">
                      {/* <Building2 class="size-4" /> */}
                      <span class="h-4">Central</span>
                    </NavLink>
                    <NavLink href="/dashboard/companies">
                      {/* <Building2 class="size-4" /> */}
                      <span class="h-4">Companies</span>
                    </NavLink>
                    <div class="flex flex-1 w-full border-b-2 border-neutral-300 dark:border-neutral-800 h-[50px]" />
                    <NavLink href="/settings">
                      <span class="h-4">Settings</span>
                      <Settings class="size-4" />
                    </NavLink>
                  </div>
                  <div class="visible xl:invisible w-full xl:w-0 h-full py-2">
                    <DropdownMenu placement="bottom-end" sameWidth>
                      <DropdownMenuTrigger
                        as={Button}
                        size="sm"
                        class="flex flex-row items-center justify-start gap-2 w-full "
                      >
                        {currentNavigation()}
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
                        <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/vehicles">
                          <Truck class="size-4" />
                          <span>Vehicles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/regions">
                          <Map class="size-4" />
                          <span>Regions</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/dashboard/companies">
                          <Building2 class="size-4" />
                          <span>Companies</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="flex flex-row items-center gap-2"
                          as={A}
                          href="/dashboard/organizations"
                        >
                          <Building2 class="size-4" />
                          <span>Central</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="flex flex-row items-center gap-2" as={A} href="/settings">
                          <Settings class="size-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div class="w-8 border-b-2 border-neutral-300 dark:border-neutral-800 h-[50px]" />
                </div>
              </nav>
            )}
          </Show>
        </div>
        <div class="flex h-[50px] w-full flex-1 border-b-2 border-neutral-300 dark:border-neutral-800"></div>
      </div>
    </div>
  );
}
