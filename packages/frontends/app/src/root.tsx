// @refresh reload
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Match, Suspense, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { Body, ErrorBoundary, Head, Html, Meta, Scripts, Title, useIsRouting } from "solid-start";
import { Toaster } from "solid-toast";
import { Auth } from "./components/Auth";
import { BreadcrumbsP } from "./components/Breadcrumbs";
import Content from "./components/Content";
import { Header } from "./components/Header";
import { TitleP } from "./components/Title";
import "./root.css";

const queryClient = new QueryClient();

export default function Root() {
  // colormode
  const [colorMode, setColorMode] = createSignal<"dark" | "light">("dark");
  const toggleColorMode = async () => {
    const cm = colorMode() === "light" ? "dark" : "light";
    setColorMode(cm);
    // store color mode in local storage
    window.localStorage.setItem("colorMode", cm);
  };

  createEffect(() => {
    // get color mode from local storage

    const cm = (window.localStorage.getItem("colorMode") as "dark" | "light" | null) ?? "dark";
    if (cm) {
      setColorMode(cm);
    }

    // keybind CTRL+B
    const handler = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        await toggleColorMode();
      }
    };

    document.addEventListener("keydown", handler);
    onCleanup(() => {
      document.removeEventListener("keydown", handler);
    });
  });

  const buildVersion = "0.0.1";
  const isRouting = useIsRouting();

  return (
    <Html lang="en" classList={{ dark: colorMode() === "dark" }}>
      <Head>
        <Title>Taxi Kasse</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="flex flex-col h-[100svh] gap-0 items-stretch bg-white dark:bg-black text-black dark:text-white font-['Inter']">
        <TitleP />
        <BreadcrumbsP />
        <Suspense>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <Auth />
              <Header />
              <Content />
              <div class="w-full h-10 p-1.5 border-t border-neutral-200 dark:border-neutral-800 justify-end items-center gap-2.5 inline-flex text-neutral-700">
                <div class="justify-center items-end gap-2.5 flex">
                  <div class="px-1 justify-center items-center gap-1 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-info"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div class="text-center text-neutral-600 text-xs font-medium select-none">
                      Build Version: {buildVersion}
                    </div>
                  </div>
                </div>
                <div class="grow shrink basis-0 h-6"></div>
                <div class="justify-center items-end gap-2.5 flex">
                  <div class="p-1 rounded-md justify-center items-center gap-1 flex">
                    <Switch
                      fallback={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-check-check"
                        >
                          <path d="M18 6 7 17l-5-5" />
                          <path d="m22 10-7.5 7.5L13 16" />
                        </svg>
                      }
                    >
                      <Match when={queryClient.isFetching() || queryClient.isMutating() || isRouting()}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="animate-spin"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      </Match>
                    </Switch>
                    <div class="text-center text-xs font-medium select-none">
                      <Switch fallback="Updated">
                        <Match when={queryClient.isFetching()}>Updating...</Match>
                        <Match when={queryClient.isMutating()}>Syncing...</Match>
                        <Match when={isRouting()}>Routing...</Match>
                      </Switch>
                    </div>
                  </div>
                </div>
              </div>
              <Toaster
                position="bottom-right"
                gutter={8}
                toastOptions={{
                  duration: 2000,
                }}
              />
            </QueryClientProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
