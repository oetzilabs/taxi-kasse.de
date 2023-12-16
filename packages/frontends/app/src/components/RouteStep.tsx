import { Match, Show, Switch } from "solid-js";
import L, { LatLng, LatLngTuple } from "leaflet";
import "leaflet-routing-machine";
import { RouteT, useRoute } from "./Route";

const ICON_SIZE = 18;

type RouteStepT = RouteT["steps"][number];

type RouteStepProps = { step: RouteStepT; next: RouteStepT | null };

const StepIcon = (props: { type?: L.Routing.IInstruction["type"] | "Head"; size?: number }) => {
  return (
    <Switch>
      <Match when={props.type === "Left"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size ?? ICON_SIZE}
          height={props.size ?? ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 14 4 9 9 4" />
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
      </Match>
      <Match when={props.type === "Right"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size ?? ICON_SIZE}
          height={props.size ?? ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 14 20 9 15 4" />
          <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
        </svg>
      </Match>
      <Match when={props.type === "Head"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size ?? ICON_SIZE}
          height={props.size ?? ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m5 9 7-7 7 7" />
          <path d="M12 16V2" />
          <circle cx="12" cy="21" r="1" />
        </svg>
      </Match>
      <Match when={props.type === "WaypointReached"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size ?? ICON_SIZE}
          height={props.size ?? ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0" />
          <circle cx="12" cy="8" r="2" />
          <path d="M8.835 14H5a1 1 0 0 0-.9.7l-2 6c-.1.1-.1.2-.1.3 0 .6.4 1 1 1h18c.6 0 1-.4 1-1 0-.1 0-.2-.1-.3l-2-6a1 1 0 0 0-.9-.7h-3.835" />
        </svg>
      </Match>
      <Match when={props.type === "DestinationReached"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size ?? ICON_SIZE}
          height={props.size ?? ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2v14" />
          <path d="m19 9-7 7-7-7" />
          <circle cx="12" cy="21" r="1" />
        </svg>
      </Match>
    </Switch>
  );
};

export const RouteStep = (props: RouteStepProps) => {
  const [route, { cancelRoute }] = useRoute();
  return (
    <div class="flex flex-row gap-4 w-max py-2 px-1 items-center justify-center">
      <div class="flex flex-col gap-2 w-max items-center justify-center">
        <div class="flex flex-row gap-2 w-max items-center justify-center">
          <div class="flex flex-row gap-2 w-max items-center justify-center">
            <StepIcon type={props.step.type} />
            <Show when={props.step.text && props.step.text}>{(text) => <span class="text-sm">{text()}</span>}</Show>
          </div>
        </div>
        <Show when={props.next && props.next}>
          {(next) => (
            <div class="flex flex-row gap-2 w-max items-center justify-center">
              <StepIcon type={next().type} size={12} />
              <span class="text-xs">{next().text}</span>
            </div>
          )}
        </Show>
      </div>
      <button
        class="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:dark:bg-neutral-900 focus:bg-neutral-100 focus:outline-none"
        onClick={() => cancelRoute()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};
