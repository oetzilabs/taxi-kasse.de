import { useColorMode } from "@kobalte/core";
import { A, createAsync, useLocation, useResolvedPath } from "@solidjs/router";
import LogIn from "lucide-solid/icons/log-in";
import Moon from "lucide-solid/icons/moon";
import Sun from "lucide-solid/icons/sun";
import { Match, Show, Switch } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { Button, buttonVariants } from "./ui/button";
import UserMenu from "./UserMenu";

export function Header() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const location = useLocation();
  const path = useResolvedPath(() => location.pathname);

  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <header class="bg-background flex flex-row w-full py-3.5 items-center justify-between">
      <div class="flex flex-row w-full items-center justify-between px-8 container mx-auto">
        <div class="flex flex-row items-center justify-start w-max gap-2">
          <A href="/" class="flex flex-row gap-4 items-center justify-center">
            <Logo small />
          </A>
        </div>
        {/* <div class="w-full flex flex-col items-center justify-center container px-0">
          <AppSearch />
        </div> */}
        <div class="w-max items-center justify-end flex flex-row gap-2">
          <div class="w-max flex text-base gap-2.5">
            <Button
              onClick={() => {
                toggleColorMode();
              }}
              size="icon"
              variant="outline"
              class="size-8 rounded-full p-0"
            >
              <Show when={colorMode() === "dark"} fallback={<Moon class="size-4" />}>
                <Sun class="size-4" />
              </Show>
            </Button>
            <Switch
              fallback={
                <A
                  href="/auth/login"
                  class={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex flex-row gap-2 items-center justify-start w-full",
                  )}
                >
                  <LogIn class="size-4" />
                  Login
                </A>
              }
            >
              <Match when={session() && session()!.user !== null && session()!.user}>
                {(user) => <UserMenu user={user()} />}
              </Match>
              <Match when={!session() || session()!.user === null}>
                <Button
                  as={A}
                  href="/auth/login"
                  variant="outline"
                  size="sm"
                  class="flex flex-row gap-2 items-center justify-center w-max"
                >
                  <LogIn class="size-3" />
                  Login
                </Button>
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </header>
  );
}
