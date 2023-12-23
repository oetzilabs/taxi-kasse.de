// @refresh reload
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Match, Suspense, Switch } from "solid-js";
import { Body, ErrorBoundary, Head, Html, Meta, Scripts, Title, useIsRouting } from "solid-start";
import { Toaster } from "solid-toast";
import { Auth } from "./components/Auth";
import { BreadcrumbsP } from "./components/Breadcrumbs";
import Content from "./components/Content";
import { Header } from "./components/Header";
import { TitleP } from "./components/Title";
import { ThemeProvider, cmMode } from "./components/theme";
import "./root.css";
import { WSProvider } from "./components/WebSocket";
import { Bottom } from "./components/Bottom";

const queryClient = new QueryClient();

export default function Root() {
  const buildVersion = "0.0.1";

  return (
    <ThemeProvider>
      <Html lang="en" classList={{ dark: cmMode[0]() === "dark" }}>
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
                <WSProvider>
                  <Header />
                  <Content />
                  <Bottom queryClient={queryClient} buildVersion={buildVersion} />
                  <Toaster
                    position="bottom-right"
                    gutter={8}
                    toastOptions={{
                      duration: 2000,
                    }}
                  />
                </WSProvider>
              </QueryClientProvider>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Body>
      </Html>
    </ThemeProvider>
  );
}
