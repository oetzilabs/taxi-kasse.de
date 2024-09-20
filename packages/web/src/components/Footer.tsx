import { footer_links } from "@/lib/utils";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer class="dark:bg-neutral-200 bg-neutral-900 flex flex-col border-t border-neutral-800 dark:border-neutral-300 w-full py-20 items-center text-white dark:text-black">
      <div class="container flex flex-row w-full items-center justify-between">
        <div class="flex flex-row justify-between w-full gap-10">
          <div class="w-max">
            <A href="/" class="flex flex-row gap-4 items-center justify-center">
              <Logo />
              <span class="font-semibold leading-none text-lg -mt-1 sr-only md:not-sr-only">Caby</span>
            </A>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20 w-full md:w-max">
            <For each={Object.entries(footer_links)}>
              {([title, links]) => (
                <div class="flex flex-col gap-4">
                  <h4 class="font-bold">{title}</h4>
                  <div class="flex flex-col gap-3">
                    <For each={links}>
                      {(link) => (
                        <A href={link.href} rel="external" class="text-sm hover:underline">
                          {link.name}
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </footer>
  );
}
