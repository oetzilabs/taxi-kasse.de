import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuth } from "../components/Auth";

export default function Home() {
  const [user] = useAuth();
  return (
    <div class="flex container mx-auto flex-col gap-4 py-10">
      <div class="flex flex-col gap-4">
        <div class="relative flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 h-[600px] rounded-sm bg-neutral-50 dark:bg-neutral-950">
          <div class="absolute bottom-0 z-10 pb-10 w-full flex flex-col items-center justify-center">
            <div>
              <Show
                when={!user().isLoading && user().isAuthenticated && user()}
                fallback={
                  <div class="">
                    <A
                      href="/login"
                      class="w-fit px-4 p-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                    >
                      Login
                    </A>
                  </div>
                }
              >
                {(user) => (
                  <div class="flex flex-col w-full">
                    <div class="flex flex-row gap-4">
                      <A
                        href="/dashboard"
                        class="w-fit px-4 p-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                      >
                        Go To Dashboard
                      </A>
                      {/* <A
                        href="/apply"
                        class="w-fit px-4 p-2 flex gap-2 items-center justify-center text-base font-bold bg-neutral-200 dark:bg-neutral-800 rounded-sm border-black !border-opacity-10 dark:border-white text-black dark:text-white"
                      >
                        Apply for a company
                      </A> */}
                    </div>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
