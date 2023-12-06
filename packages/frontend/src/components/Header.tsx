import { Accessor, JSX, Setter, createContext, createEffect, createSignal, useContext } from "solid-js";
import { cn } from "../utils/cn";
import { UserMenu } from "./UserMenu";

const HeaderContext = createContext({
  visible: () => true,
  setVisible: () => {},
  height: () => 0,
} as {
  visible: Accessor<boolean>;
  setVisible: Setter<boolean>;
  height: Accessor<number>;
});

export const Header = (props: { children: JSX.Element }) => {
  const [visible, setVisible] = createSignal(true);
  const [height, setHeight] = createSignal(0);

  createEffect(() => {
    setHeight(document.querySelector("nav")?.clientHeight ?? 0);
  });

  return (
    <HeaderContext.Provider
      value={{
        visible,
        setVisible,
        height,
      }}
    >
      <nav
        class={cn(
          "flex items-center justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 w-full",
          {
            "hidden !h-0": !visible(),
          }
        )}
      >
        <div class="flex items-center justify-between flex-wrap w-full mx-auto p-8">
          <UserMenu />
        </div>
      </nav>
      {props.children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  return useContext(HeaderContext);
};
