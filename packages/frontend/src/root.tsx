// @refresh reload
import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import { Auth } from "./components/Auth";
import "./root.css";

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
            <nav class="flex items-center justify-between flex-wrap bg-white dark:bg-black p-2 border-b border-black/5 dark:border-white/5 fixed w-screen top-0 z-50">
              <Auth />
            </nav>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
