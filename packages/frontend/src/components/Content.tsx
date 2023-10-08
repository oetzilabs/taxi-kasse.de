import { JSX } from "solid-js";
import { FileRoutes, Routes } from "solid-start";
import { useHeader } from "./Header";
import { cn } from "../utils/cn";

export default function Content() {
  const { visible } = useHeader();
  return (
    <div
      class={cn("pt-[49px]", {
        "pt-0": !visible(),
      })}
    >
      <Routes>
        <FileRoutes />
      </Routes>
    </div>
  );
}
