// @refresh reload
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createContext, createEffect, createSignal, onCleanup, Setter, Accessor, JSX } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import { Toaster } from "solid-toast";
import { AuthC, AuthP } from "./components/Auth";
import "./root.css";
import { Header } from "./components/Header";
import Content from "./components/Content";

const queryClient = new QueryClient();

export default function Root() {
  // colormode
  const [colorMode, setColorMode] = createSignal("light");
  const toggleColorMode = () => {
    setColorMode(colorMode() === "light" ? "dark" : "light");
  };
  createEffect(() => {
    // keybind CTRL+B
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        toggleColorMode();
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
                      <AuthC />
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
