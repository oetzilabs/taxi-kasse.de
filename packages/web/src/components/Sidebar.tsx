import { createAsync, useLocation, useResolvedPath } from "@solidjs/router";
import Building2 from "lucide-solid/icons/building-2";
import Car from "lucide-solid/icons/car";
import Home from "lucide-solid/icons/home";
import Map from "lucide-solid/icons/map";
import Settings from "lucide-solid/icons/settings";
import Store from "lucide-solid/icons/store";
import Truck from "lucide-solid/icons/truck";
import { Show } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import NavLink from "./NavLink";

export default function Sidebar() {
  const session = createAsync(() => getAuthenticatedSession());
  const list = [
    "/dashboard",
    "/dashboard/rides",
    "/dashboard/vehicles",
    "/dashboard/regions",
    "/dashboard/organizations",
    "/dashboard/companies",
    "/settings",
  ];

  const location = useLocation();

  const resolvedPath = useResolvedPath(() => location.pathname);
  const isNotInList = () => !list.some((item) => item.startsWith(resolvedPath() ?? ""));
  const lastPathSegment = () => (isNotInList() ? resolvedPath()?.split("/").at(-1) : undefined);

  return (
    <div class="flex flex-col w-full ">
      <div class="flex flex-row w-full">
        <div class="flex w-full flex-1 "></div>
        <div class="container flex flex-col mx-0 px-0">
          <Show when={session() && session()!.user !== null}>
            {(s) => (
              <nav class="flex flex-col w-full border-b border-neutral-200 dark:border-neutral-800 lg:border-none shadow-sm lg:shadow-none">
                <div class="flex flex-row w-full items-center h-max">
                  <div class="w-8" />
                  <div class="flex flex-row items-center w-full gap-4">
                    <NavLink exact href="/dashboard">
                      <Home class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Dashboard</span>
                    </NavLink>
                    <NavLink href="/dashboard/rides">
                      <Car class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Rides</span>
                    </NavLink>
                    <NavLink href="/dashboard/vehicles">
                      <Truck class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Vehicles</span>
                    </NavLink>
                    <NavLink href="/dashboard/regions">
                      <Map class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Regions</span>
                    </NavLink>
                    <NavLink href="/dashboard/organizations">
                      <Building2 class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Central</span>
                    </NavLink>
                    <NavLink href="/dashboard/companies">
                      <Store class="size-5 not-sr-only lg:sr-only" />
                      <span class="sr-only lg:not-sr-only">Companies</span>
                    </NavLink>
                    <Show when={lastPathSegment()}>
                      {(lps) => (
                        <>
                          <div class="size-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                          <NavLink href={resolvedPath() ?? ""}>
                            <span class="sr-only lg:not-sr-only capitalize">{lps()}</span>
                          </NavLink>
                        </>
                      )}
                    </Show>
                    <div class="flex flex-1 w-full  " />
                    <NavLink href="/settings">
                      <span class="sr-only lg:not-sr-only">Settings</span>
                      <Settings class="size-5 lg:size-4" />
                    </NavLink>
                  </div>
                  <div class="w-8" />
                </div>
              </nav>
            )}
          </Show>
        </div>
        <div class="flex  w-full flex-1 "></div>
      </div>
    </div>
  );
}
