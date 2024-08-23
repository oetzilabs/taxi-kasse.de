import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Button } from "./ui/button";

function UsedByComopaniesSection() {
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
    <div class="pb-20 container mx-auto flex flex-col gap-20">
      <div class="flex flex-row gap-8 w-full ">
        <h3 class="text-5xl font-bold text-gray-800 dark:text-white">Used by these Companies</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-8 w-full items-center justify-center">
        <For each={companies}>
          {(c) => (
            <div class="w-full h-16 flex flex-col items-center justify-center">
              <img
                src={c.image}
                alt={c.name}
                class="w-full h-full max-w-80 xl:max-w-full bg-neutral-100 dark:bg-neutral-900 rounded-lg outline-none"
                title={c.name}
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

export default UsedByComopaniesSection;
