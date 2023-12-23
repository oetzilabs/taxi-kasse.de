import {} from "@solid-primitives/scheduled";
import { createReconnectingWS, createWS, makeWS } from "@solid-primitives/websocket";
import { Mutation, createMutation } from "@tanstack/solid-query";
import { Notify } from "@taxi-kassede/core/entities/notifications";
import { Accessor, createContext, createEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { useAuth } from "./Auth";
import { z } from "zod";
import { Mutations } from "../utils/api/mutations";

export type WSStatus = "connected" | "disconnected" | "pinging" | "sending" | "connecting";

type WSCtxValue = {
  status: Accessor<WSStatus>;
  ws: Accessor<ReturnType<typeof createReconnectingWS> | null>;
  queue: Accessor<any[]>;
  errors: Accessor<string[]>;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  isDimissing: Accessor<boolean>;
  isDimissingAll: Accessor<boolean>;
};

export const WSCtx = createContext<WSCtxValue>({
  status: () => "disconnected" as WSStatus,
  ws: () => null,
  queue: () => [],
  errors: () => [],
  dismiss: (id: string) => {},
  dismissAll: () => {},
  isDimissing: () => false,
  isDimissingAll: () => false,
});

export const WSProvider = (props: { children: any }) => {
  const [status, setStatus] = createSignal<WSStatus>("disconnected");
  const [errors, setErrors] = createSignal<string[]>([]);
  const [queue, setQueue] = createSignal<Notify[]>([]);
  const [ws, setWS] = createSignal<ReturnType<typeof createReconnectingWS> | null>(null);
  const [isDimissing, setIsDimissing] = createSignal(false);
  const [isDimissingAll, setIsDimissingAll] = createSignal(false);

  const dismiss = createMutation(() => ({
    mutationFn: async (id: string) => {
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      setIsDimissing(true);
      const dismissedNotification = await Mutations.Notifications.dismiss(token, id);
      const q = queue();
      const x = q.filter((n) => n.id !== dismissedNotification.notificationId);
      setQueue(x);
      setIsDimissing(false);
      return x;
    },
    mutationKey: ["dismiss-notification"],
  }));

  const dismissAll = createMutation(() => ({
    mutationFn: async () => {
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      setIsDimissingAll(true);
      const dismissedNotifications = await Mutations.Notifications.dismissAll(token);
      setQueue([]);
      setIsDimissingAll(false);
      return dismissedNotifications;
    },
    mutationKey: ["dismiss-all-notifications"],
  }));

  const handlers = {
    message: (e: any) => {
      const data = JSON.parse(e.data);
      const n = z.custom<Notify>().parse(data);
      setQueue([...queue(), n]);
    },
    open: (e: any) => {
      const userId = auth.user?.id;
      if (!userId) return;
      const w = ws();
      if (!w) return;
      w.send(JSON.stringify({ action: "ping", userId }));
      setStatus("connected");
    },
    close: (e: any) => {
      console.log("ws closed", e);
      setStatus("disconnected");
    },
    error: (e: any) => {
      console.log("ws errored", e);
      setErrors([...errors(), e]);
    },
  };

  const [auth] = useAuth();

  createEffect(() => {
    const userID = auth.user?.id;
    if (!userID) return;
    // subscribe to websocket
    const ws = createReconnectingWS(import.meta.env.VITE_NOTIFICATION_WS_URL);
    setStatus("connecting");

    ws.addEventListener("open", handlers.open);
    ws.addEventListener("close", handlers.close);
    ws.addEventListener("error", handlers.error);
    ws.addEventListener("message", handlers.message);
    const interval = setInterval(() => {
      if (!auth.user?.id) return;
      ws.send(JSON.stringify({ action: "ping", userId: auth.user?.id }));
    }, 10000);
    onCleanup(() => {
      ws.close();
      ws.removeEventListener("message", handlers.message);
      ws.removeEventListener("open", handlers.open);
      ws.removeEventListener("close", handlers.close);
      ws.removeEventListener("error", handlers.error);
      clearInterval(interval);
    });
    setWS(ws);
  });

  return (
    <WSCtx.Provider
      value={{
        status,
        ws,
        queue,
        errors,
        dismiss: dismiss.mutateAsync,
        dismissAll: dismissAll.mutateAsync,
        isDimissing,
        isDimissingAll,
      }}
    >
      {props.children}
    </WSCtx.Provider>
  );
};

export const useWS = () => {
  const ctx = useContext(WSCtx);
  return ctx;
};
