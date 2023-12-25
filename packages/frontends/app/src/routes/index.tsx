import { onCleanup, onMount } from "solid-js";
import { useAuth } from "../components/Auth";
import { setStretchedBottom, stretchedBottom } from "../components/Bottom";

export default function Home() {
  const [user] = useAuth();
  onMount(() => {
    const oldStretchedBottom = stretchedBottom();
    setStretchedBottom(false);
    onCleanup(() => {
      setStretchedBottom(oldStretchedBottom);
    });
  });
  return <div class="flex w-full flex-col gap-4"></div>;
}
