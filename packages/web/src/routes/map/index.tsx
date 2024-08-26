import { clientOnly } from "@solidjs/start";
import Loader2 from "lucide-solid/icons/loader-2";
import { Suspense } from "solid-js";
import { Controls } from "../../components/Controls";
import { ControlsProvider } from "../../components/providers/controls";

const Map = clientOnly(() => import("@/components/Map"));

export default function MapPage() {
  return (
    <ControlsProvider>
      <div class="flex flex-row gap-0 w-full grow relative">
        <Suspense fallback={<div class="flex flex-col items-center justify-center w-full grow">Loading...</div>}>
          <Map
            fallback={
              <div class="flex flex-col items-center justify-center w-full grow">
                <Loader2 class="size-8 animate-spin" />
              </div>
            }
          />
        </Suspense>
        <div class="flex flex-col gap-0 w-[380px] h-full absolute top-0 left-0 z-50 pl-6 py-6 items-center justify-end">
          <div class="flex flex-col w-full h-max  bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
            <Controls />
          </div>
        </div>
      </div>
    </ControlsProvider>
  );
}
