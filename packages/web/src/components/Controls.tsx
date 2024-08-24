import { CheckCheck, CheckCircle2, Circle, Eye, EyeOff, PauseCircle, XCircle } from "lucide-solid";
import { For, JSX, Show, useContext } from "solid-js";
import { useControls } from "./providers/controls";
import { Speedometer } from "./Speedometer";
import { Button } from "./ui/button";

const cRIcons: Record<string, JSX.Element> = {
  active: <CheckCircle2 class="size-6 text-teal-500" />,
  completed: <CheckCheck class="size-6 text-teal-500" />,
  cancelled: <XCircle class="size-6 text-red-500" />,
  paused: <PauseCircle class="size-6 text-yellow-500" />,
  idle: <Circle class="size-6 text-neutral-500" />,
};

export const Controls = () => {
  const controls = useControls();
  return (
    <div class="flex flex-col gap-0 w-full h-full">
      <div class="flex flex-row items-center justify-between w-full px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="text-lg font-bold">Controls</div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            controls?.setControls({ ...controls.controls, enabled: !controls?.controls.enabled });
          }}
        >
          <Show when={controls?.controls.enabled} fallback={<Eye class="size-4 " />}>
            <EyeOff class="size-4" />
          </Show>
        </Button>
      </div>
      <Show when={controls?.controls.enabled}>
        <div class="flex flex-col gap-0 w-full h-full">
          {/* <For
            each={controls?.controls.features}
            fallback={<div class="flex flex-col gap-0 w-full h-full">No features</div>}
          >
            {(feature) => (
              <div class="flex flex-col gap-0 w-full h-full">
                <span class="text-sm font-bold">{feature.name}</span>
              </div>
            )}
          </For> */}
          <div class="flex flex-row items-center justify-center w-full py-4">
            <Speedometer />
          </div>
          <Show when={controls?.controls.currentRide}>
            {(cR) => (
              <div class="flex flex-row items-center justify-between w-full px-8 py-6 border-t border-neutral-200 dark:border-neutral-800">
                <div class="">{cR().status}</div>
                <div class="">{cRIcons[cR().status]}</div>
              </div>
            )}
          </Show>
        </div>
      </Show>
    </div>
  );
};
