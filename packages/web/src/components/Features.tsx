import { BookText, ChartSpline, Workflow } from "lucide-solid";
import { For } from "solid-js";

function FeatureSection() {
  const features = [
    {
      title: "Automate Earnings",
      description: "No more manual tracking – our tool does it all for you.",
      icon: <Workflow class="size-10" />, // Replace with your icon path or use an SVG directly
    },
    {
      title: "Monthly Reports",
      description: "Receive clear, concise reports every month.",
      icon: <BookText class="size-10" />,
    },
    {
      title: "Ride Analysis",
      description: "Optimize your operations with detailed ride data.",
      icon: <ChartSpline class="size-10" />,
    },
  ];

  return (
    <section class="py-32">
      <div class="w-full space-y-12">
        <div class="space-y-6">
          <h3 class="text-5xl font-bold text-gray-800 dark:text-white">Why Taxi-Kasse.de?</h3>
          <p class="text-xl text-muted-foreground">
            Automate your earnings, get monthly reports, and analyze your rides for better profitability – all in one
            place.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={features}>
            {(feature) => (
              <div class="flex flex-col items-center text-center gap-4 border border-neutral-200 dark:border-neutral-800 p-12 rounded-xl">
                {feature.icon}
                <h4 class="text-xl font-semibold text-gray-800 dark:text-white">{feature.title}</h4>
                <p class="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
