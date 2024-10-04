import { A, RouteDefinition } from "@solidjs/router";
import { Button } from "../components/ui/button";
import { getAuthenticatedSession } from "../lib/auth/util";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function NotFound() {
  return (
    <main class="py-10 container mx-auto flex flex-col items-center justify-center h-[calc(100dvh-73px)]">
      <div class="max-w-lg flex flex-col gap-4 -mt-[200px]">
        <h1 class="text-8xl font-bold text-gray-800">404</h1>
        <p class="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</p>
        <p class="mt-2 text-gray-500">
          Sorry, the page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Button as={A} href="/">
          Go Back Home
        </Button>
      </div>
    </main>
  );
}
