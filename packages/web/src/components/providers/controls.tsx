import { createContextProvider } from "@solid-primitives/context";
import { update } from "@solid-primitives/signal-builders";
import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createQuery, isServer } from "@tanstack/solid-query";
import { createEffect, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

type BoxedRide = {
  speed: number;
} & (
  | {
      status: "active";
      distance: number;
    }
  | {
      status: "completed";
      distance: number;
    }
  | {
      status: "cancelled";
      reason: string;
    }
  | {
      status: "paused";
      distance: number;
      reason: string;
    }
  | {
      status: "idle";
    }
);

export type ControlsStore = {
  enabled: boolean;
  currentRide: BoxedRide;
  features: Record<
    string,
    {
      enabled: boolean;
    }
  >;
};

export const [ControlsProvider, useControls] = createContextProvider((props: { children: JSX.Element }) => {
  const speedQuery = createQuery(() => ({
    queryKey: ["speed"],
    queryFn: async () => {
      let speed = 0;
      navigator.geolocation.getCurrentPosition(
        (p) => {
          speed = p.coords.speed ?? 0;
        },
        (e) => {
          console.log(e);
        },
      );
      return speed;
    },
    refetchInterval: 1000,
    get enabled() {
      return !isServer;
    },
  }));

  const DEFAULT_FEATURES = {
    speedometer: {
      enabled: true,
    },
  };

  const [controls, setControls] = makePersisted(
    createStore<ControlsStore>({
      enabled: true,
      currentRide: {
        status: "idle",
        speed: 0,
      },
      features: {
        speedometer: {
          enabled: true,
        },
      },
    }),
    {
      name: "controls-store",
      storage: cookieStorage,
    },
  );

  createEffect(() => {
    if (speedQuery.isPending) return;
    if (!speedQuery.isSuccess) return;
    const speed = speedQuery.data;
    setControls((s) => {
      const newRide: BoxedRide = {
        ...s.currentRide,
        speed,
      };
      return {
        ...s,
        currentRide: newRide,
      };
    });
  });

  const resetFeatures = () => {
    setControls(update(controls, "features", DEFAULT_FEATURES));
  };

  return {
    controls,
    setControls,
    resetFeatures,
  };
});
