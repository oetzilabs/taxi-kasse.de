import { Accessor, Setter, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore, produce } from "solid-js/store";

const [BreadcrumbsStore, setBreadcrumbsStore] = createStore<{
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
  isLoading: boolean;
}>({
  breadcrumbs: [],
  isLoading: true,
});

export const BreadcrumbsP = () => {
  const [oldPath, setOldPath] = createSignal<string | null>(null);

  const toBeFilteredOut = ["login", "register", "logout"];

  createEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname === oldPath()) return;
      setOldPath(window.location.pathname);
      setBreadcrumbsStore(produce((s) => (s.isLoading = true)));
      const path = window.location.pathname
        .replace(window.location.host, "")
        .replace(window.location.protocol, "")
        .replace(window.location.port, "")
        .replace(window.location.origin, "")
        .replace("#", "")
        .replace("?", "");

      for (const filter of toBeFilteredOut) {
        if (path.startsWith(filter)) {
          setBreadcrumbsStore(produce((s) => (s.isLoading = false)));
          return;
        }
      }
      const paths = path.split("/");
      if (paths[0] === "") paths.shift();
      if (paths[paths.length - 1] === "") paths.pop();
      const _breadcrumbs = paths.map((p, i) => {
        return {
          label: p,
          href: `/${paths.slice(0, i + 1).join("/")}`,
        };
      });
      setBreadcrumbsStore(
        produce((s) => {
          s.breadcrumbs = _breadcrumbs;
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

export const useBreadcrumbs = () => {
  return BreadcrumbsStore;
};
