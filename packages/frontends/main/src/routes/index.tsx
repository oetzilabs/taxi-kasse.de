import { A } from "@solidjs/router";
import { onCleanup, onMount } from "solid-js";
import { setStretchedBottom, stretchedBottom } from "../components/Bottom";

export default function Home() {
  onMount(() => {
    const oldStretchedBottom = stretchedBottom();
    setStretchedBottom(false);
    onCleanup(() => {
      setStretchedBottom(oldStretchedBottom);
    });
  });
  return (
    <div class="flex w-full flex-col gap-4 py-8 md:px-0 px-4">
      <div class="flex flex-col gap-8 items-center justify-center">
        <h1 class="text-5xl font-bold">TAXI-KASSE</h1>
        <p class="text-xl text-neutral-500">Keep track of your taxi rides and calculate your monthly income.</p>
        <div class="flex gap-4">
          <A
            href={import.meta.env.VITE_APP_URL ?? "http://localhost:3000"}
            target="_blank"
            class="bg-emerald-500 text-white py-2 px-5 rounded-full items-center justify-center flex gap-2 shadow-sm border border-emeral-600 dark:border-emerald-700 glow-effect"
            data-glow-offset="true"
          >
            Go To App
          </A>
          <A
            href="/about"
            class="bg-white text-black py-2 px-5 rounded-full items-center justify-center flex gap-2 border border-neutral-300 dark:border-transparent shadow-sm"
          >
            More Info
          </A>
        </div>
      </div>
    </div>
  );
}
