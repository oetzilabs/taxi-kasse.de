import { update } from "@solid-primitives/signal-builders";
import Check from "lucide-solid/icons/check";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import ListRestart from "lucide-solid/icons/list-restart";
import X from "lucide-solid/icons/x";
import { Show } from "solid-js";
import { toast } from "solid-sonner";
import { useControls } from "../../providers/controls";
import { Button } from "../../ui/button";

export const SettingsView = (props: { onSave: () => void; onClose: () => void }) => {
  const controls = useControls();
  if (!controls) return <div>Loading...</div>;

  return (
    <div class="flex flex-col gap-0 w-full h-full">
      <div class="flex flex-row items-center justify-between w-full px-4 py-3 text-sm">
        <span class="text-sm font-bold">Features</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            controls.resetFeatures();
          }}
        >
          Reset
        </Button>
      </div>
      <div class="flex flex-row items-center justify-between w-full px-4 py-3 text-sm border-b border-neutral-200 dark:border-neutral-800">
        <span>Speedometer</span>
        <Button
          variant="outline"
          onClick={() => {
            const speedometerFeature = controls.controls.features.speedometer;
            if (!speedometerFeature) {
              toast.error("Speedometer feature not found");
              return;
            }

            const enabled = !speedometerFeature.enabled;

            controls.setControls(update(controls.controls, "features", "speedometer", "enabled", enabled));
          }}
          size="sm"
          class="flex flex-row items-center gap-2"
        >
          <Show
            when={controls.controls.features.speedometer.enabled}
            fallback={
              <>
                <EyeOff class="size-4" />
                Hidden
              </>
            }
          >
            <Eye class="size-4" />
            Visible
          </Show>
        </Button>
      </div>
    </div>
  );
};
