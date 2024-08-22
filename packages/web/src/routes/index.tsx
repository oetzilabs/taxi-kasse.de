import { A, createAsync, RouteDefinition } from "@solidjs/router";
import { Button } from "~/components/ui/button";
import { getAuthenticatedSession } from "~/lib/auth/util";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Show } from "solid-js";
import FeatureSection from "~/components/Features";
import TestimonialSection from "~/components/Testimonials";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function Dashboard() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <main class="w-full flex flex-col gap-0 pb-40">
      <section class="text-center flex flex-col gap-8 py-28">
        <div class="flex flex-col gap-6">
          <h2 class="text-8xl font-bold text-gray-800 dark:text-white">Cab Driving Magic</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Taxi-Kasse.de bringt Ihr Taxiunternehmen ins digitale Zeitalter - effizient, übersichtlich und
            benutzerfreundlich.
          </p>
        </div>
        <div class="flex flex-row gap-6 w-full items-center justify-center">
          <Show when={session()}>
            <Button size="lg" as={A} href="/auth/login" class="h-12 rounded-xl text-lg">
              Register Now!
            </Button>
            <Button size="lg" as={A} href="/about" class="h-12 rounded-xl text-lg" variant="outline">
              Learn More
            </Button>
          </Show>
        </div>
      </section>
      <section class="flex flex-col gap-0 w-full">
        <div class="flex flex-col gap-2 w-full container mx-auto">
          <img
            src="/assets/images/hero.png"
            alt="Dashboard"
            class="bg-neutral-100 dark:bg-neutral-900 rounded-tr-xl rounded-tl-xl h-[300px] shadow-2xl -z-10 border-x border-t border-neutral-200 dark:border-neutral-800"
          />
        </div>
        <div class="flex flex-col gap-2 w-full border-t border-neutral-200 dark:border-neutral-800 z-0 bg-background h-max">
          <div class="container mx-auto h-max min-h-40">
            <FeatureSection />
          </div>
          <TestimonialSection />
        </div>
      </section>
      <section class="text-center">
        <a
          href="#"
          class="inline-block font-bold py-4 px-8 rounded-full text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
        >
          Jetzt 30 Tage kostenlos testen!
        </a>
      </section>
    </main>
  );
}
