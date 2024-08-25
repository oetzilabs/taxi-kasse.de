import BookText from "lucide-solid/icons/book-text";
import ChartSpline from "lucide-solid/icons/chart-spline";
import Workflow from "lucide-solid/icons/workflow";
import { createSignal, For, onCleanup, Show } from "solid-js";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";

const features = [
  {
    id: "automate-earnings",
    title: "Automate Earnings",
    description: "No more manual tracking - our tool does it all for you.",
    icon: <Workflow class="size-4" />, // Replace with your icon path or use an SVG directly
    contents: (
      <div class="flex flex-col gap-2 w-full grow">
        <div class="flex flex-col gap-2 items-center justify-center  w-full grow">
          <span class="text-muted-foreground">Automate Earnings</span>
        </div>
      </div>
    ),
  },
  {
    id: "monthly-reports",
    title: "Monthly Reports",
    description: "Receive clear, concise reports every month.",
    icon: <BookText class="size-4" />,
    contents: (
      <div class="flex flex-col gap-2 w-full grow">
        <div class="flex flex-col gap-2 items-center justify-center w-full grow">
          <span class="text-muted-foreground">Monthly Reports</span>
        </div>
      </div>
    ),
  },
  {
    id: "ride-analysis",
    title: "Ride Analysis",
    description: "Optimize your operations with detailed ride data.",
    icon: <ChartSpline class="size-4" />,
    contents: (
      <div class="flex flex-col gap-2 w-full grow">
        <div class="flex flex-col gap-2 items-center justify-center w-full grow">
          <span class="text-muted-foreground">Ride Analysis</span>
        </div>
      </div>
    ),
  },
];

function FeatureSection() {
  const [activeFeature, setActiveFeature] = createSignal<(typeof features)[number]["id"]>("automate-earnings");

  const [activeFeatureDoneByUser, setActiveFeatureDoneByUser] = createSignal(false);

  const rollFeature = () => {
    if (activeFeatureDoneByUser()) return;
    let xI = features.findIndex((f) => f.id === activeFeature());
    if (xI === -1) xI = 0;
    let nextIndex = (xI + 1) % features.length;
    const nextFeature = features[nextIndex];
    setActiveFeature(nextFeature.id);
  };

  const i = setInterval(rollFeature, 5000);

  onCleanup(() => clearInterval(i));
  // createEffect(() => {});

  const getActiveContent = () => {
    const aF = activeFeature();
    if (!aF) return null;
    return features.find((f) => f.id === aF)?.contents ?? null;
  };

  return (
    <div class="py-20 flex flex-col h-max w-full">
      <div class="w-full container mx-auto flex flex-col gap-20 h-max">
        <div class="flex flex-col gap-6 w-full">
          <Badge class="w-max" variant="outline">
            Features
          </Badge>
          <h3 class="text-5xl font-bold text-gray-800 dark:text-white">Everything you need to drive effortlessly</h3>
          <p class="text-xl text-muted-foreground">
            Automate your earnings, get monthly reports, and analyze your rides for better profitability – all in one
            place.
          </p>
        </div>
        <div class="flex flex-col md:flex-row border border-neutral-300 dark:border-neutral-800 rounded-xl w-full h-max">
          <div class="flex flex-col gap-2 border-b md:border-b-0 md:border-r border-neutral-300 dark:border-neutral-800 p-2 w-full md:w-max">
            <For each={features}>
              {(feature) => (
                <div
                  class="flex flex-col items-start gap-0"
                  onClick={() => {
                    if (activeFeature() === feature.id) {
                      setActiveFeature("automate-earnings");
                      setActiveFeatureDoneByUser(true);
                    } else {
                      setActiveFeature(feature.id);
                      setActiveFeatureDoneByUser(false);
                    }
                  }}
                >
                  <div
                    class={cn(
                      "flex flex-col w-full h-fit md:max-w-96 rounded-md p-6 select-none cursor-pointer gap-4 transform transition-colors duration-500 ease-in-out",
                      {
                        "bg-neutral-200 dark:bg-neutral-800": activeFeature() === feature.id,
                        "hover:bg-neutral-100 dark:hover:bg-neutral-900": activeFeature() !== feature.id,
                      },
                    )}
                  >
                    <div class="flex flex-col gap-12">
                      <h4 class="text-lg font-semibold text-gray-800 dark:text-white flex flex-row items-center justify-between">
                        {feature.title}
                        {feature.icon}
                      </h4>
                      <p class="text-muted-foreground grow flex items-end justify-start">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
          <div class="flex flex-col w-full p-2 h-96 md:flex-1 md:grow md:h-auto">
            <div class="flex flex-col w-full p-2 flex-1 grow border border-neutral-300 dark:border-neutral-800 rounded-md">
              <Show when={getActiveContent()} keyed>
                {(aC) => aC}
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureSection;
