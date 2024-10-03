import FeatureSection from "@/components/Features";
import { Footer } from "@/components/Footer";
import TestimonialSection from "@/components/Testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UsedByCompaniesSection from "@/components/UsedByCompanies";
import { generateReferralCode } from "@/lib/api/referral";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/utils/cn";
import { A, createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Loader2 from "lucide-solid/icons/loader-2";
import Share from "lucide-solid/icons/share-2";
import Sparkles from "lucide-solid/icons/sparkles";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
  load: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function Dashboard() {
  const session = createAsync(() => getAuthenticatedSession());
  let bannerRef: HTMLDivElement;
  let heroRef: HTMLDivElement;
  let titleRef: HTMLDivElement;
  const [isVisible, setIsVisible] = createSignal(false);
  const [titleVisible, setTitleVisible] = createSignal(false);
  const [showHero, setShowHero] = createSignal(false);

  createEffect(() => {
    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          titleObserver.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the banner is visible
      },
    );

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

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowHero(true);
          heroObserver.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05, // Trigger when 10% of the banner is visible
      },
    );

    if (bannerRef) {
      observer.observe(bannerRef);
    }
    if (heroRef) {
      heroObserver.observe(heroRef);
    }
    if (titleRef) {
      titleObserver.observe(titleRef);
    }

    onCleanup(() => {
      if (bannerRef) {
        observer.unobserve(bannerRef);
      }
      if (heroRef) {
        heroObserver.unobserve(heroRef);
      }
      if (titleRef) {
        titleObserver.unobserve(titleRef);
      }
    });
  });

  const generateReferralCodeAction = useAction(generateReferralCode);
  const generateReferralCodeStatus = useSubmission(generateReferralCode);

  return (
    <main class="w-full flex flex-col gap-0">
      {/* <div class="absolute w-full h-full bg-gradient-to-r from-sky-500 via-teal-400 to-orange-500 -z-10 blur-[400px] opacity-5" /> */}
      <section class="flex flex-col gap-8 py-20 container mx-auto h-max">
        <div class="flex flex-col gap-6 ">
          <div
            class={cn("transition-all flex flex-col gap-4 duration-1000 ease-in-out opacity-0 translate-y-10", {
              "opacity-100 translate-y-0": titleVisible(),
            })}
          >
            <h2
              class="transition-[font-size] text-5xl md:text-8xl font-bold text-gray-800 dark:text-white leading-[60px]"
              ref={titleRef!}
            >
              Cab Driving{" "}
              <span class="text-gradient-primary-to-secondary-from-bottom bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 relative">
                Magic
                <div class="absolute top-0 right-0 flex flex-row gap-2 items-center transform translate-x-full -translate-y-0 md:translate-y-5">
                  <div class="flex flex-row gap-2 items-center px-2 py-0.5 md:px-2 md:py-1 text-white dark:text-black rounded-lg text-[10px] md:text-xs bg-gradient-to-r from-blue-400 to-teal-300 font-medium h-6 md:h-auto">
                    <Sparkles class="size-3" />
                    Beta
                  </div>
                </div>
              </span>
            </h2>
          </div>
          <div
            class={cn("transition-all flex flex-col gap-4 duration-1000 ease-in-out opacity-0 translate-y-10", {
              "opacity-100 translate-y-0": titleVisible(),
            })}
            style={{
              "transform-origin": "top center",
              "animation-duration": "1s",
              "transition-duration": "1s",
              "animation-delay": "0.2s",
              "transition-delay": "0.2s",
            }}
          >
            <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Caby transforms your taxi business for the digital age — streamlined, intuitive, and designed
              with your needs in mind.
            </p>
          </div>
        </div>
        <div
          class={cn("transition-all flex flex-col gap-4 duration-1000 ease-in-out opacity-0 translate-y-10", {
            "opacity-100 translate-y-0": titleVisible(),
          })}
          style={{
            "transform-origin": "top center",
            "animation-duration": "1s",
            "transition-duration": "1s",
            "animation-delay": "0.4s",
            "transition-delay": "0.4s",
          }}
        >
          <div class="flex flex-row gap-3 w-full relative">
            <Show
              when={session() && session()!.user !== null}
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
        </div>
      </section>
      <section class="flex flex-col gap-0 w-full" ref={heroRef!}>
        <div class="flex flex-col gap-2 w-full container mx-auto h-auto md:h-[300px] overflow-clip">
          <img
            src="/assets/images/hero.png"
            alt="Dashboard"
            class={cn(
              "transition-all bg-white dark:bg-neutral-900 rounded-t-xl w-full aspect-video -z-10 border-x border-t border-neutral-300 dark:border-neutral-800 opacity-0 translate-y-40 ease-in-out",
              {
                "opacity-100 translate-y-0": showHero(),
              },
            )}
            style={{
              "transform-origin": "top center",
              "animation-duration": "1.5s",
              "transition-duration": "1.5s",
              "animation-delay": "0.6s",
              "transition-delay": "0.6s",
            }}
          />
        </div>
        <div class="flex flex-col gap-0 w-full border-t border-neutral-200 dark:border-neutral-800 z-0 bg-background h-max">
          <FeatureSection />
          <UsedByCompaniesSection />
          <TestimonialSection />
        </div>
      </section>
      <section
        ref={bannerRef!}
        class="w-full py-40 bg-gradient-to-b from-black to-neutral-900 dark:from-white dark:to-neutral-200 "
      >
        <div class="container mx-auto">
          <Show
            when={session() && session()!.user === null}
            fallback={
              <div class="flex flex-col gap-12">
                <div
                  class={cn("transition-all flex flex-col gap-4 duration-1000 ease-in-out opacity-0 translate-y-10", {
                    "opacity-100 translate-y-0": isVisible(),
                  })}
                >
                  <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white dark:text-black">
                    You love it? <br />
                    Recommend it to your friends & colleagues!
                  </h2>
                  <p class="text-sm font-bold text-white md:text-lg/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed dark:text-black uppercase">
                    It's Free for two weeks!
                  </p>
                </div>
                <div
                  class={cn("transition-all duration-1000 ease-in-out delay-300 opacity-0 translate-y-10", {
                    "opacity-100 translate-y-0": isVisible(),
                  })}
                >
                  <Button
                    class="bg-white text-black hover:bg-neutral-100 hover:text-black flex flex-row items-center gap-2"
                    size="lg"
                    disabled={generateReferralCodeStatus.pending}
                    onClick={async () => {
                      let referral_code = session()!.user!.referral_code;
                      if (!referral_code) {
                        referral_code = await generateReferralCodeAction();
                        await revalidate([getAuthenticatedSession.key]);
                      }
                      if ("navigator" in window) {
                        navigator.share({
                          title: "Share the app",
                          text: "Check out the new Caby app!",
                          url: `https://taxi-kasse.de/referral/${referral_code}`,
                        });
                      }
                    }}
                  >
                    <div class="w-max">
                      Share the app<span class="text-blue-500 font-bold">*</span>
                    </div>
                    <Show when={generateReferralCodeStatus.pending} fallback={<Share class="size-4" />}>
                      <Loader2 class="size-4 animate-spin" />
                    </Show>
                  </Button>
                </div>
                <div
                  class={cn(
                    "transition-all flex flex-col gap-4 duration-1000 delay-500  ease-in-out opacity-0 translate-y-10",
                    {
                      "opacity-100 translate-y-0": isVisible(),
                    },
                  )}
                >
                  <p class="text-xs font-bold text-white/50 dark:text-black/50">
                    <span class="text-blue-500 font-bold">*</span> We are working on a referral program, stay tuned!
                  </p>
                </div>
              </div>
            }
          >
            <div class="flex flex-col gap-12">
              <div
                class={cn("transition-all flex flex-col gap-4 duration-1000 ease-in-out opacity-0 translate-y-10", {
                  "opacity-100 translate-y-0": isVisible(),
                })}
              >
                <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white dark:text-black">
                  If you think you'll like it, try it out!
                </h2>
                <p class="text-sm font-bold text-white md:text-lg/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed dark:text-black uppercase">
                  It's Free for two weeks!
                </p>
              </div>
              <div
                class={cn("transition-all duration-1000 ease-in-out delay-300 opacity-0 translate-y-10", {
                  "opacity-100 translate-y-0": isVisible(),
                })}
              >
                <Button
                  class="bg-white text-black hover:bg-neutral-100 hover:text-black"
                  size="lg"
                  as={A}
                  href="/auth/login"
                >
                  Start Your Free Trial
                  <ArrowRight class="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Show>
        </div>
      </section>
      <Footer />
    </main>
  );
}
