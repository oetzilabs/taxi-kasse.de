import { FileRoutes, Routes } from "solid-start";

export default function Content() {
  return (
    <div class="inline-flex flex-col flex-1 w-full items-stretch">
      <div class="w-full flex-col flex-1 gap-2.5 inline-flex overflow-auto">
        <Routes>
          <FileRoutes />
        </Routes>
      </div>
    </div>
  );
}
