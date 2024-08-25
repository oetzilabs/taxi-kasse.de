import { Accessor, createSignal, onCleanup } from "solid-js";
import { useControls } from "../providers/controls";
import { Skeleton } from "../ui/skeleton";

type SpeedometerProps = {};

export default function Speedometer(props: SpeedometerProps) {
  const controls = useControls();

  const currentSpeed = () =>
    controls?.controls.currentRide?.status === "active" ? controls?.controls.currentRide?.speed : 0;
  const maxSpeed = 200;

  const speedSteps: Array<[[number, number], string]> = [
    // percentage-range, color
    [[0, 25], "#333333"],
    [[25, 75], "#33bb88"],
    [[75, 100], "#ffbe0b"],
    [[100, Infinity], "#e63946"],
  ];

  // // Simulate speed changes
  // const interval = setInterval(() => {
  //   setCurrentSpeed((prev) => (prev + 20) % (maxSpeed + 1));
  // }, 2000);

  // onCleanup(() => clearInterval(interval));

  const speedPercent = () => (currentSpeed() / maxSpeed) * 100;

  const color = () =>
    speedSteps.find(([range]) => speedPercent() >= range[0] && speedPercent() <= range[1])?.[1] ?? "#333333";

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  return (
    <div class="px-4 py-16 grid gap-4 w-full">
      <div class="relative w-full flex flex-row items-center justify-center">
        <svg class="w-2/3" viewBox="0 0 200 100">
          <path
            d={describeArc(100, 100, 80, 0, 180)}
            fill="none"
            stroke-width="16"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="stroke-neutral-200 dark:stroke-neutral-800"
          />
          {/* Speedometer fill */}
          <path
            d={describeArc(100, 100, 80, 0, (180 * speedPercent()) / 100)}
            fill="none"
            stroke={color()}
            stroke-width="16"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          {/* Digital speed display */}
          <text
            x="100"
            y="70"
            text-anchor="middle"
            fill="currentColor"
            class="text-3xl font-bold text-black dark:text-white"
          >
            {currentSpeed()}
          </text>
          <text fill="currentColor" x="100" y="90" text-anchor="middle" class="text-sm text-black dark:text-white">
            km/h
          </text>
        </svg>
      </div>
    </div>
  );
}
