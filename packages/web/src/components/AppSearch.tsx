import type { UserSession } from "@/lib/auth/util";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { useColorMode } from "@kobalte/core";
import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import Search from "lucide-solid/icons/search";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";

type Option = {
  label: string;
  value: string;
  onSelect(user: UserSession): Promise<void>;
};

type List = {
  label: string;
  options: Option[];
};

export const AppSearch = () => {
  const location = useLocation();
  const paths = ["/", "/auth/login", "/auth/verify-email"];
  const available = () => paths.includes(location.pathname);
  const [openSearch, setOpenSearch] = createSignal(false);
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const { setColorMode, toggleColorMode, colorMode } = useColorMode();
  const navigate = useNavigate();

  const DEFAULT_DATA: List[] = [
    {
      label: "Suggestions",
      options: [],
    },
    {
      label: "User",
      options: [
        {
          label: "Profile",
          value: "Profile",
          onSelect: async () => {
            navigate("/profile");
            setOpenSearch(false);
          },
        },
        {
          label: "Settings",
          value: "Settings",
          onSelect: async () => {
            navigate("/profile/settings");
            setOpenSearch(false);
          },
        },
      ],
    },
    {
      label: "Theme",
      options: [
        {
          label: "Dark Mode",
          value: "Dark Mode",
          onSelect: async (user) => {
            setColorMode("dark");
          },
        },
        {
          label: "Light Mode",
          value: "Light Mode",
          onSelect: async (user) => {
            setColorMode("light");
          },
        },
        {
          label: "System Mode",
          value: "System Mode",
          onSelect: async (user) => {
            setColorMode("system");
          },
        },
      ],
    },
  ];

  const [data, setData] = createSignal<List[]>(DEFAULT_DATA);

  createEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((o) => !o);
      }
    };

    document.addEventListener("keydown", down);

    onCleanup(() => {
      document.removeEventListener("keydown", down);
    });
  });

  return (
    <div class="flex flex-row items-center w-full">
      <Show when={!available()}>
        <div
          class="flex flex-row items-center justify-between rounded-lg border-transparent border md:border-neutral-200 dark:md:border-neutral-800 px-3 pr-2 h-10 gap-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground bg-background w-full"
          onClick={() => setOpenSearch(true)}
        >
          <div class="flex flex-row items-center gap-2 w-full">
            <Search class="size-4" />
            <div class="w-full text-sm">Commands</div>
          </div>
          <div class="flex flex-row items-center gap-2">
            <kbd class="text-[10px] text-muted-foreground font-semibold leading-[0.5rem] bg-neutral-100 dark:bg-neutral-900 rounded-sm p-2">
              Ctrl+K
            </kbd>
          </div>
        </div>
        <CommandDialog open={openSearch()} onOpenChange={setOpenSearch}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <For each={data()}>
              {(list, i) => (
                <>
                  <CommandGroup heading={list.label}>
                    <For each={list.options}>
                      {(option) => (
                        <CommandItem
                          class="flex flex-row items-center gap-2"
                          onSelect={() => {
                            const sess = session();
                            if (!sess) return;
                            if (!sess.user) return;
                            option.onSelect(sess);
                          }}
                        >
                          {option.label}
                        </CommandItem>
                      )}
                    </For>
                  </CommandGroup>
                  <Show when={i() !== data().length - 1}>
                    <CommandSeparator />
                  </Show>
                </>
              )}
            </For>
          </CommandList>
        </CommandDialog>
      </Show>
    </div>
  );
};
