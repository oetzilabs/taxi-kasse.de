import { update } from "@solid-primitives/signal-builders";
import Check from "lucide-solid/icons/check";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import ListRestart from "lucide-solid/icons/list-restart";
import X from "lucide-solid/icons/x";
import { For, lazy, Show } from "solid-js";
import { toast } from "solid-sonner";
import { Transition } from "solid-transition-group";
import { cn } from "../../../lib/utils";
import { useControls } from "../../providers/controls";
import { Button } from "../../ui/button";

const featuresList: Record<string, ReturnType<typeof lazy>> = {
  speedometer: lazy(() => import("../../features/Speedometer")),
  orders: lazy(() => import("../../features/Orders")),
};

export const ControlsView = () => {
  const controls = useControls();
  if (!controls) return <div>Loading...</div>;

  return (
    <>
      <div
        class={cn("flex flex-row items-center justify-between w-full px-4 py-3", {
          "border-b border-neutral-200 dark:border-neutral-800": !controls.controls.enabled,
        })}
      >
        <div class="text-sm font-bold">Controls</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const enabled = !controls.controls.enabled;
            controls.setControls(update(controls.controls, "enabled", enabled));
          }}
          class="flex flex-row items-center gap-2"
        >
          <Show
            when={controls.controls.enabled}
            fallback={
              <>
                <EyeOff class="size-4" /> Disabled
              </>
            }
          >
            <Eye class="size-4" /> Enabled
          </Show>
        </Button>
      </div>
      <Transition name="slide-fade-up">
        <Show when={controls.controls.enabled}>
          <div class="flex flex-col gap-0 w-full h-full">
            <For
              each={Object.entries(controls.controls.features ?? {})}
              fallback={<div class="flex flex-col gap-0 w-full h-full">No features</div>}
            >
              {([feature, config]) => {
                const Feature = featuresList[feature];
                if (!Feature) return null;
                if (!config.enabled) {
                  return null;
                }
                return (
                  <div class="w-full h-full flex flex-col gap-0">
                    <Feature {...config} />
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </Transition>
    </>
  );
};
