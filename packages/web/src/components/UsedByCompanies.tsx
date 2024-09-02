import { A } from "@solidjs/router";
import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";

function UsedByCompaniesSection() {
  let logoCloudRef: HTMLDivElement;
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
        threshold: 0.2, // Trigger when 10% of the banner is visible
      },
    );

    if (logoCloudRef) {
      observer.observe(logoCloudRef);
    }

    onCleanup(() => {
      if (logoCloudRef) {
        observer.unobserve(logoCloudRef);
      }
    });
  });
  const companies = [
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
    {
      name: "Taxi-Kasse.de",
      image: "/assets/images/companies/taxi-kasse.png",
    },
  ];

  return (
    <div class="pb-20 container mx-auto flex flex-col gap-20" ref={logoCloudRef!}>
      <div class="flex flex-row gap-8 w-full ">
        <h3 class="text-5xl font-bold text-gray-800 dark:text-white">Used by these Companies</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-8 w-full items-center justify-center">
        <For each={companies}>
          {(c, i) => (
            <div class="w-full h-16 flex flex-col items-center justify-center">
              <div
                // src={c.image}
                // alt={c.name}
                class={cn(
                  "transition-all w-full h-full max-w-80 xl:max-w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg outline-none opacity-0 translate-y-10",
                  {
                    "opacity-100 translate-y-0": isVisible(),
                  },
                )}
                title={c.name}
                style={{
                  "transform-origin": "top center",
                  "animation-delay": `${i() * 0.2}s`,
                  "transition-delay": `${i() * 0.2}s`,
                  "animation-duration": "1s",
                  "transition-duration": "1s",
                }}
              />
            </div>
          )}
        </For>
      </div>
      <div class="flex flex-col gap-12 w-full">
        <span class="text-4xl font-bold">Want to be featured on our website?</span>
        <Button as={A} href="/contact" class="w-max">
          Contact Us!
        </Button>
      </div>
    </div>
  );
}

export default UsedByCompaniesSection;
