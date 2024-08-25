import Bolt from "lucide-solid/icons/bolt";
import CheckCheck from "lucide-solid/icons/check-check";
import CheckCircle2 from "lucide-solid/icons/check-circle-2";
import Circle from "lucide-solid/icons/circle";
import PauseCircle from "lucide-solid/icons/pause-circle";
import X from "lucide-solid/icons/x";
import XCircle from "lucide-solid/icons/x-circle";
import { createSignal, JSX, Match, Show, Switch } from "solid-js";
import { cn } from "../lib/utils";
import { ControlsView } from "./features/controls-view/controls";
import { SettingsView } from "./features/controls-view/settings";
import { useControls } from "./providers/controls";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const cRIcons: Record<string, JSX.Element> = {
  active: <CheckCircle2 class="size-4 text-teal-500" />,
  completed: <CheckCheck class="size-4 text-teal-500" />,
  cancelled: <XCircle class="size-4 text-red-500" />,
  paused: <PauseCircle class="size-4 text-yellow-500" />,
  idle: <Circle class="size-4 text-neutral-500" />,
};

export const Controls = () => {
  const controls = useControls();
  if (!controls) return <div>Loading...</div>;

  const [view, setView] = createSignal<"default" | "settings">("default");

  return (
    <div
      class="flex flex-col gap-0 w-full h-[calc-size(auto)] select-none transform transition-[height] duration-300 ease-in-out"
      style={{
        "transition-behavior": "allow-discrete",
      }}
    >
      <div class="flex flex-row items-center justify-between w-full px-4 py-3 text-sm border-b border-neutral-200 dark:border-neutral-800">
        <div class="text-sm font-bold">Settings</div>
        <div class="">
          <Button
            size="icon"
            onClick={() => {
              const v = view();
              if (v === "settings") {
                setView("default");
                return;
              }
              setView("settings");
            }}
            class="size-8"
          >
            <Show when={view() === "default"}>
              <Bolt class="size-4" />
            </Show>
            <Show when={view() === "settings"}>
              <X class="size-4" />
            </Show>
          </Button>
        </div>
      </div>
      <Switch>
        <Match when={view() === "default"}>
          <ControlsView />
        </Match>
        <Match when={view() === "settings"}>
          <SettingsView onClose={() => setView("default")} onSave={() => setView("default")} />
        </Match>
      </Switch>
      <Show when={controls?.controls.currentRide}>
        {(cR) => (
          <div
            class={cn("flex flex-row items-center justify-between w-full px-4 py-3 text-sm", {
              "border-t border-neutral-200 dark:border-neutral-800": controls.controls.enabled,
            })}
          >
            <Badge variant="outline" class="">
              {cR().status}
            </Badge>
            <div class="">{cRIcons[cR().status]}</div>
          </div>
        )}
      </Show>
    </div>
  );
};
