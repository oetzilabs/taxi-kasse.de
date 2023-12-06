import { createContext, Accessor, Setter, createSignal, createEffect, onCleanup, useContext } from "solid-js";

const TitleContext = createContext<{
  value: [Accessor<string | null>, Setter<string | null>];
  isLoading: Accessor<boolean>;
}>({
  value: [() => null, () => {}],
  isLoading: () => true,
});

export const TitleP = (props: { children: any }) => {
  const [oldTitle, setOldTitle] = createSignal<string | null>(null);
  const [title, setTitle] = createSignal<string | null>("Taxi Kasse");
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  createEffect(() => {
    const interval = setInterval(() => {
      if (document.title === oldTitle()) return;
      setOldTitle(document.title);
      setIsLoading(true);
      const title = document.title;
      setTitle(title);
      setIsLoading(false);
    }, 100);
    onCleanup(() => {
      clearInterval(interval);
    });
  });
  return (
    <TitleContext.Provider
      value={{
        value: [title, setTitle],
        isLoading: isLoading,
      }}
    >
      {props.children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => {
  const title = useContext(TitleContext);
  if (!title) throw new Error("useTitle must be used within an TitleProvider");
  return title;
};
