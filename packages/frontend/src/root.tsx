// @refresh reload
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { Body, ErrorBoundary, Head, Html, Meta, Scripts, Title } from "solid-start";
import { Toaster } from "solid-toast";
import { AuthP } from "./components/Auth";
import Content from "./components/Content";
import { Header } from "./components/Header";
import { UserMenu } from "./components/UserMenu";
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

  return (
    <Html lang="en" classList={{ dark: colorMode() === "dark" }}>
      <Head>
        <Title>Taxi Kasse</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="bg-white dark:bg-black text-black dark:text-white">
        <Suspense>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthP>
                <Header
                  header={
                    <div class="flex items-center justify-between flex-wrap  container mx-auto py-2 px-8">
                      <UserMenu />
                    </div>
                  }
                >
                  <Content />
                </Header>
                <Toaster
                  position="bottom-right"
                  gutter={8}
                  toastOptions={{
                    duration: 2000,
                  }}
                />
              </AuthP>
            </QueryClientProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
