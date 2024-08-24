import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

type HeaderMenuStore = {
  enabled: boolean;
  list: Array<{
    href: string;
    value: string;
    label: string;
  }>;
};

export const [headerMenu, setHeaderMenu] = makePersisted(
  createStore<HeaderMenuStore>({
    enabled: true,
    list: [
      {
        href: "/dashboard",
        value: "dashboard",
        label: "Dashboard",
      },
      {
        href: "/dashboard/rides",
        value: "rides",
        label: "Rides",
      },
      {
        href: "/dashboard/messages",
        value: "messages",
        label: "Messages",
      },
    ],
  }),
  {
    name: "header-menu-enabled",
    storage: cookieStorage,
  },
);
