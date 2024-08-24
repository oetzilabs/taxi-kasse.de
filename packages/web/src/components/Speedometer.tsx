import { createSignal, onCleanup } from "solid-js";

export const Speedometer = () => {
  const [currentSpeed, setCurrentSpeed] = createSignal(0);
  const maxSpeed = 200;

  const speedSteps = {
    // green
    0: "#333333",
    25: "#33bb88",
    50: "#33bb88",
    75: "#ffbe0b",
    80: "#ffbe0b",
    100: "#ffbe0b",
    120: "#e63946",
  };

  // // Simulate speed changes
  // const interval = setInterval(() => {
  //   setCurrentSpeed((prev) => (prev + 20) % (maxSpeed + 1));
  // }, 2000);

  // onCleanup(() => clearInterval(interval));

  const speedPercent = () => (currentSpeed() / maxSpeed) * 100;

  const color = () => {
    if (currentSpeed() <= 25) return speedSteps[0];
    if (currentSpeed() <= 50) return speedSteps[25];
    if (currentSpeed() <= 75) return speedSteps[50];
    if (currentSpeed() <= 80) return speedSteps[75];
    if (currentSpeed() <= 100) return speedSteps[80];
    if (currentSpeed() <= 120) return speedSteps[100];
    if (currentSpeed() > 120) return speedSteps[120];
  };

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
    <div class="p-4 grid gap-4">
      <div class="relative">
        <svg class="w-full" viewBox="0 0 200 100">
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
};
