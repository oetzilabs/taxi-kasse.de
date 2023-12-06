import { createContext, Accessor, Setter, createSignal, createEffect, onCleanup, useContext } from "solid-js";

const BreadcrumbsContext = createContext<{
  value: [
    Accessor<
      Array<{
        label: string;
        href: string;
      }>
    >,
    Setter<
      Array<{
        label: string;
        href: string;
      }>
    >
  ];
  isLoading: Accessor<boolean>;
}>({
  value: [() => [], () => {}],
  isLoading: () => true,
});

export const BreadcrumbsP = (props: { children: any }) => {
  const [oldPath, setOldPath] = createSignal<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = createSignal<
    Array<{
      label: string;
      href: string;
    }>
  >([]);
  const [isLoadingBreadcrumbs, setIsLoadingBreadcrumbs] = createSignal<boolean>(true);

  const toBeFilteredOut = ["", "dashboard", "login", "register", "logout", "settings", "profile", "users", "companies"];

  createEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname === oldPath()) return;
      setOldPath(window.location.pathname);
      setIsLoadingBreadcrumbs(true);
      const path = window.location.pathname
        .replace(window.location.host, "")
        .replace(window.location.protocol, "")
        .replace(window.location.port, "")
        .replace(window.location.origin, "")
        .replace("#", "")
        .replace("?", "");

      for (const filter of toBeFilteredOut) {
        if (path.startsWith(filter)) {
          setIsLoadingBreadcrumbs(false);
          return;
        }
      }

      const paths = path.split("/");
      if (paths[0] === "") paths.shift();
      if (paths[paths.length - 1] === "") paths.pop();
      const _breadcrumbs = paths.map((p, i) => {
        return {
          label: p,
          href: paths.slice(0, i + 1).join("/"),
        };
      });
      setBreadcrumbs(_breadcrumbs);
      setIsLoadingBreadcrumbs(false);
    }, 100);
    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return (
    <BreadcrumbsContext.Provider
      value={{
        value: [breadcrumbs, setBreadcrumbs],
        isLoading: isLoadingBreadcrumbs,
      }}
    >
      {props.children}
    </BreadcrumbsContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const breadcrumbs = useContext(BreadcrumbsContext);
  if (!breadcrumbs) throw new Error("useBreadcrumbs must be used within an BreadcrumbsProvider");
  return breadcrumbs;
};
