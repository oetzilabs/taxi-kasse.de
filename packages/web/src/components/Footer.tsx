import { footer_links } from "@/lib/utils";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Logo } from "./ui/custom/logo";

export function Footer() {
  return (
    <footer class="bg-neutral-50 dark:bg-black flex flex-col border-t border-neutral-200 dark:border-neutral-800 w-full px-4 py-10 items-center">
      <div class="container flex flex-row w-full items-center justify-between px-4 ">
        <div class="flex flex-row justify-between w-full gap-10">
          <div class="w-max">
            <A href="/" class="flex flex-row gap-4 items-center justify-center">
              <Logo />
              <span class="font-semibold leading-none text-lg -mt-1 sr-only md:not-sr-only">plaaaner.com</span>
            </A>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20 w-full md:w-max">
            <For each={Object.entries(footer_links)}>
              {([title, links]) => (
                <div class="flex flex-col gap-4">
                  <h4 class="text-base font-semibold text-[#4F46E4]">{title}</h4>
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
