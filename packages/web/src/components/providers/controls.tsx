import { createContextProvider } from "@solid-primitives/context";
import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { JSX } from "solid-js";
import { createStore } from "solid-js/store";

export type ControlsStore = {
  enabled: boolean;
  currentRide: {
    status: "active" | "completed" | "cancelled" | "paused" | "idle";
  };
  features: Array<{
    name: string;
    enabled: boolean;
  }>;
};

export const [ControlsProvider, useControls] = createContextProvider((props: { children: JSX.Element }) => {
  const [controls, setControls] = makePersisted(
    createStore<ControlsStore>({
      enabled: true,
      currentRide: {
        status: "idle",
      },
      features: [],
    }),
    {
      name: "controls-store",
      storage: cookieStorage,
    },
  );

  return {
    controls,
    setControls,
  };
});
