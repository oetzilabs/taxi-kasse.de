import {} from "@solid-primitives/scheduled";
import { createReconnectingWS, createWS, makeWS } from "@solid-primitives/websocket";
import { createMutation } from "@tanstack/solid-query";
import { Notify } from "@taxi-kassede/core/entities/notifications";
import { Accessor, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { useAuth } from "./Auth";

type NotificationCtxValue = {
  queue: Accessor<Notify[]>;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

export const NotificationCtx = createContext<NotificationCtxValue>({
  queue: () => [],
  dismiss: (id: string) => {},
  dismissAll: () => {},
});

export const NotificationProvider = (props: { children: any }) => {
  const [queue, setQueue] = createSignal<Notify[]>([]);

  const dismiss = createMutation(() => ({
    mutationFn: async (id: string) => {
      const newQueue = queue().filter((n) => n.id !== id);
      setQueue(newQueue);
      return newQueue;
    },
    mutationKey: ["dismiss-notification"],
  }));

  const dismissAll = createMutation(() => ({
    mutationFn: async () => {
      setQueue([]);
      return [];
    },
    mutationKey: ["dismiss-all-notifications"],
  }));

  const handleMessage = (e: any) => {
    const data = JSON.parse(e.data);
    if (data.message === "Forbidden") {
      console.log(e);
      return;
    }
    console.log("ws message", data);
  };

  const [auth] = useAuth();

  onMount(() => {
    // subscribe to websocket
    const ws = createReconnectingWS(import.meta.env.VITE_NOTIFICATION_WS_URL);
    ws.addEventListener("open", (e) => {
      // ping the server to update the session
    });
    ws.addEventListener("close", (e) => {
      console.log("ws closed");
    });
    ws.addEventListener("error", (e) => {
      console.log("ws error", e);
    });
    ws.addEventListener("message", handleMessage);
    const interval = setInterval(() => {
      if (!auth.user?.id) return;
      ws.send(JSON.stringify({ action: "ping", userId: auth.user?.id }));
    }, 10000);
    onCleanup(() => {
      ws.close();
      ws.removeEventListener("message", handleMessage);
      clearInterval(interval);
    });
  });

  return (
    <NotificationCtx.Provider value={{ queue, dismiss: dismiss.mutateAsync, dismissAll: dismissAll.mutateAsync }}>
      {props.children}
    </NotificationCtx.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationCtx);
  return ctx;
};
