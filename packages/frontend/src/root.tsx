// @refresh reload
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import { Auth } from "./components/Auth";
import "./root.css";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Taxi Kasse</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <nav class="flex items-center justify-between flex-wrap bg-white dark:bg-black p-2 border-b border-black/5 dark:border-white/5">
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
