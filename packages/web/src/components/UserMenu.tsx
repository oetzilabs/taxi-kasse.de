import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSession } from "@/lib/auth/util";
import { A, useAction, useSubmission } from "@solidjs/router";
import { Cloud, Eye, EyeOff, Keyboard, LifeBuoy, Loader2, LogOut, Settings, User } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { headerMenu, setHeaderMenu } from "./stores/headermenu";

export default function UserMenu(props: { user: UserSession["user"] }) {
  const logoutAction = useAction(logout);
  const isLoggingOut = useSubmission(logout);

  return (
    <DropdownMenu placement="bottom-end" gutter={4}>
      <DropdownMenuTrigger
        as={Button}
        variant="default"
        class="flex flex-row items-center justify-center size-8 p-0 rounded-full"
      >
        <User class="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel class="flex flex-col gap-0.5">
            <span class="font-bold">My Account</span>
            <span class="text-xs text-muted-foreground font-normal">{props.user!.email}</span>
          </DropdownMenuGroupLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as={A} class="cursor-pointer" href="/profile">
            <User class="size-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem as={A} class="cursor-pointer" href="/profile/settings">
            <Settings class="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard class="size-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            class="cursor-pointer"
            onClick={() => setHeaderMenu((s) => ({ ...s, enabled: !s.enabled }))}
          >
            <Switch>
              <Match when={headerMenu.enabled}>
                <Eye class="size-4" />
                <span>Hide Menu</span>
              </Match>
              <Match when={!headerMenu.enabled}>
                <EyeOff class="size-4" />
                <span>Show Menu</span>
              </Match>
            </Switch>
            <span></span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LifeBuoy class="size-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud class="size-4" />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout} method="post">
          <DropdownMenuItem
            class="text-rose-500 hover:!text-white dark:hover:!bg-rose-600 hover:!bg-rose-500 w-full"
            disabled={isLoggingOut.pending}
            as={"button"}
            closeOnSelect={false}
            type="submit"
          >
            <Switch fallback={<LogOut class="size-4" />}>
              <Match when={isLoggingOut.pending}>
                <Loader2 class="size-4 animate-spin" />
              </Match>
            </Switch>
            <span>Log out</span>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
