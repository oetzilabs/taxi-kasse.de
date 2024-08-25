import { A, createAsync, RouteDefinition } from "@solidjs/router";
import FeatureSection from "~/components/Features";
import TestimonialSection from "~/components/Testimonials";
import { Button } from "~/components/ui/button";
import { getAuthenticatedSession } from "~/lib/auth/util";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import ArrowRight from "lucide-solid/icons/arrow-right";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Footer } from "../components/Footer";
import UsedByComopaniesSection from "../components/UsedByCompanies";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function Dashboard() {
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  let bannerRef: HTMLDivElement;
  const [isVisible, setIsVisible] = createSignal(false);

  createEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the banner is visible
      },
    );

    if (bannerRef) {
      observer.observe(bannerRef);
    }

    onCleanup(() => {
      if (bannerRef) {
        observer.unobserve(bannerRef);
      }
    });
  });
  return (
    <main class="w-full flex flex-col gap-0">
      {/* <div class="absolute w-full h-full bg-gradient-to-r from-sky-500 via-teal-400 to-orange-500 -z-10 blur-[400px] opacity-5" /> */}
      <section class="flex flex-col gap-8 py-20 container mx-auto h-max">
        <div class="flex flex-col gap-6">
          <h2 class="text-8xl font-bold text-gray-800 dark:text-white">
            Cab Driving{" "}
            <span class="text-gradient-primary-to-secondary-from-bottom bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              Magic
            </span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Taxi-Kasse.de transforms your taxi business for the digital age — streamlined, intuitive, and designed with
            your needs in mind.
          </p>
        </div>
        <div class="flex flex-row gap-3 w-full relative">
          <Show
            when={session() && !session()!.user !== null}
            fallback={
              <Button as={A} href="/auth/login">
                Register Now!
              </Button>
            }
          >
            <Button as={A} href="/dashboard">
              Go to Dashboard!
            </Button>
          </Show>
          <Button as={A} href="/about" variant="secondary">
            Learn More
          </Button>
        </div>
      </section>
      <section class="flex flex-col gap-0 w-full">
        <div class="flex flex-col gap-2 w-full container mx-auto h-[300px] overflow-clip">
          <img
            src="/assets/images/hero.png"
            alt="Dashboard"
            class="bg-neutral-900 dark:bg-neutral-100 rounded-t-xl w-full aspect-video  -z-10 border-x border-t border-neutral-800 dark:border-neutral-300"
          />
        </div>
        <div class="flex flex-col gap-0 w-full border-t border-neutral-200 dark:border-neutral-800 z-0 bg-background h-max">
          <FeatureSection />
          <UsedByComopaniesSection />
          <TestimonialSection />
        </div>
      </section>
      <Show when={session() && session()!.user === null}>
        <section ref={bannerRef!} class="w-full py-40 bg-gradient-to-r from-sky-300 to-teal-300">
          <div class="container mx-auto">
            <div class="flex flex-col gap-12">
              <div
                class={`transition-all flex flex-col gap-4 duration-1000 ease-in-out ${isVisible() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  If you think you'll like it, try it out!
                </h2>
                <p class="text-sm font-bold text-white md:text-lg/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed dark:text-white uppercase">
                  It's Free for a week
                </p>
              </div>
              <div
                class={`transition-all duration-1000 ease-in-out delay-300 ${isVisible() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <Button
                  class="bg-white text-sky-700 hover:bg-neutral-100 hover:text-sky-800"
                  size="lg"
                  as={A}
                  href="/auth/login"
                >
                  Start Your Free Trial
                  <ArrowRight class="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Show>
      <Footer />
    </main>
  );
}
