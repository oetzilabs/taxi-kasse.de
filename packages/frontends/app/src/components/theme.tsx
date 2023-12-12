import { createSignal, createContext, Accessor, Setter, useContext, JSX, createEffect, onCleanup } from "solid-js";

export type ThemeColors = "dark" | "light";

export const cmMode = createSignal<"dark" | "light">("dark");
export const Theme = createContext<[Accessor<ThemeColors>, Setter<ThemeColors>]>(cmMode);
export const useTheme = () => {
  const colorMode = useContext(Theme);
  return colorMode;
};

export const ThemeProvider = (props: { children: JSX.Element }) => {
  // colormode
  const toggleColorMode = () => {
    const cm = cmMode[0]() === "light" ? "dark" : "light";
    cmMode[1](cm);
    // store color mode in local storage
    window.localStorage.setItem("colorMode", cm);
  };

  createEffect(() => {
    // get color mode from local storage
    const cm = (window.localStorage.getItem("colorMode") as "dark" | "light" | null) ?? "dark";
    if (cm) {
      cmMode[1](cm);
    }

    // keybind CTRL+B
    const handler = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        toggleColorMode();
      }
    };

    document.addEventListener("keydown", handler);
    onCleanup(() => {
      document.removeEventListener("keydown", handler);
    });
  });
  return <Theme.Provider value={cmMode}>{props.children}</Theme.Provider>;
};
