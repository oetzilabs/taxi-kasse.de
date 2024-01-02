import {} from "@solid-primitives/scheduled";
import { createReconnectingWS, createWS, makeWS } from "@solid-primitives/websocket";
import { Mutation, createMutation } from "@tanstack/solid-query";
import { Notify } from "@taxi-kassede/core/entities/notifications";
import { Accessor, createContext, createEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { useAuth } from "./Auth";
import { z } from "zod";
import { Mutations } from "../utils/api/mutations";
import dayjs from "dayjs";

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
  statistics: Accessor<{
    stream: number;
    failed: number;
  }>;
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
  statistics: () => ({
    stream: 0,
    failed: 0,
  }),
});

type PongMessage = {
  action: "pong";
  recievedId: string;
  sentAt: string;
};

type PingMessage = {
  action: "ping";
  userId: string;
  id: string;
};

export const WSProvider = (props: { children: any }) => {
  const [status, setStatus] = createSignal<WSStatus>("disconnected");
  const [errors, setErrors] = createSignal<string[]>([]);
  const [sentQueue, setSentQueue] = createSignal<any[]>([]);
  const [recievedQueue, setRecievedQueue] = createSignal<Notify[]>([]);
  const [ws, setWS] = createSignal<ReturnType<typeof createReconnectingWS> | null>(null);
  const [isDimissing, setIsDimissing] = createSignal(false);
  const [isDimissingAll, setIsDimissingAll] = createSignal(false);
  const [statistics, setStatistics] = createSignal<{
    stream: number;
    failed: number;
  }>({
    stream: 0,
    failed: 0,
  });

  const dismiss = createMutation(() => ({
    mutationFn: async (id: string) => {
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      setIsDimissing(true);
      const dismissedNotification = await Mutations.Notifications.dismiss(token, id);
      const q = recievedQueue();
      const x = q.filter((n) => n.id !== dismissedNotification.notificationId);
      setRecievedQueue(x);
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
      setRecievedQueue([]);
      setIsDimissingAll(false);
      return dismissedNotifications;
    },
    mutationKey: ["dismiss-all-notifications"],
  }));

  const createPingMessage = (): PingMessage => {
    const userId = auth.user?.id;
    if (!userId) throw new Error("No user id");
    const id = Math.random().toString(36).substring(2);
    return {
      action: "ping",
      userId,
      id,
    };
  };

  const updateDownstream = (pongMessage: PongMessage) => {
    const s = statistics();
    const counterPart = sentQueue().find((x) => x.id === pongMessage.recievedId);
    const delta = dayjs(Date.now()).diff(pongMessage.sentAt, "millisecond");
    if (!counterPart) {
      return updateFailed();
    }
    // remove from sentQueue
    const x = sentQueue().filter((x) => x.id !== pongMessage.recievedId);
    setSentQueue(x);
    setStatistics({
      ...s,
      stream: delta,
    });
  };

  const updateFailed = () => {
    const s = statistics();
    setStatistics({
      ...s,
      failed: s.failed + 1,
    });
  };

  const handlers = {
    message: (e: any, ...a: any) => {
      console.log("ws additional info", a);
      const data = JSON.parse(e.data);
      const n = z.custom<Notify>().parse(data);
      setRecievedQueue([...recievedQueue(), n]);
      // update downstream
      const pongMessage = z.custom<PongMessage>().safeParse(data);
      if (pongMessage.success) {
        updateDownstream(pongMessage.data);
      } else {
        // updateFailed();
      }
    },
    open: (e: any) => {
      const userId = auth.user?.id;
      if (!userId) return;
      const w = ws();
      if (!w) return;
      const pm = createPingMessage();
      setSentQueue([...sentQueue(), pm]);
      w.send(JSON.stringify(pm));
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
      const pm = createPingMessage();
      setSentQueue([...sentQueue(), pm]);
      ws.send(JSON.stringify(pm));
    }, 2000);
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
        queue: recievedQueue,
        errors,
        dismiss: dismiss.mutateAsync,
        dismissAll: dismissAll.mutateAsync,
        isDimissing,
        isDimissingAll,
        statistics,
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
