import { Accessor, Setter, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore, produce } from "solid-js/store";

const [TitleStore, setTitleStore] = createStore<{
  value: string | null;
  isLoading: boolean;
}>({
  value: null,
  isLoading: true,
});

export const TitleP = () => {
  const [oldTitle, setOldTitle] = createSignal<string | null>(null);
  createEffect(() => {
    const interval = setInterval(() => {
      if (document.title === oldTitle()) return;
      setOldTitle(document.title);
      setTitleStore(
        produce((s) => {
          s.value = document.title;
          s.isLoading = false;
        })
      );
    }, 100);
    onCleanup(() => {
      clearInterval(interval);
    });
  });
  return <div />;
};

export const useTitle = () => {
  return TitleStore;
};
