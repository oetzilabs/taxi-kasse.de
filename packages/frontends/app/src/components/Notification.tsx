import {} from "@solid-primitives/scheduled";
import { createReconnectingWS, createWS, makeWS } from "@solid-primitives/websocket";
import { Mutation, createMutation } from "@tanstack/solid-query";
import { Notify } from "@taxi-kassede/core/entities/notifications";
import { Accessor, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { useAuth } from "./Auth";
import { z } from "zod";
import { Mutations } from "../utils/api/mutations";

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
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      const dismissedNotification = await Mutations.Notifications.dismiss(token, id);
      const q = queue();
      const x = q.filter((n) => n.id !== dismissedNotification.notificationId);
      setQueue(x);
      return x;
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
    const n = z.custom<Notify>().parse(data);
    setQueue([...queue(), n]);
    console.log("ws message", data);
  };

  const [auth] = useAuth();

  onMount(() => {
    // subscribe to websocket
    const ws = createReconnectingWS(import.meta.env.VITE_NOTIFICATION_WS_URL);

    ws.addEventListener("open", (e) => {
      // ping the server to update the session
      // ask for notifications
      if (!auth.user?.id) return;
      ws.send(JSON.stringify({ action: "ping", userId: auth.user?.id }));
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
