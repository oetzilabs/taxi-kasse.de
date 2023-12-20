import { Accessor, Setter, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { cn } from "../utils/cn";
import { UserMenu } from "./UserMenu";

const HeaderStore = createStore({
  visible: () => true,
  setVisible: () => {},
  height: () => 0,
} as {
  visible: Accessor<boolean>;
  setVisible: Setter<boolean>;
  height: Accessor<number>;
});

export const Header = () => {
  const [visible, setVisible] = createSignal(true);
  const [height, setHeight] = createSignal(0);

  createEffect(() => {
    setHeight(document.querySelector("nav")?.clientHeight ?? 0);
  });

  return (
    <nav
      class={cn(
        "flex items-center sticky top-0 z-50 justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 w-full",
        {
          "hidden !h-0": !visible(),
        }
      )}
    >
      <div class="flex items-center justify-between flex-wrap w-full mx-auto p-8">
        <UserMenu />
      </div>
    </nav>
  );
};

export const useHeader = () => {
  return HeaderStore;
};
