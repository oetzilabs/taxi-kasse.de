import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { JSX } from "solid-js";
import { createGlobalEmitter } from "@solid-primitives/event-bus";
import { createAsync } from "@solidjs/router";
import mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import { getAuthenticatedSession } from "../lib/auth/util";

type MqttContextType = {
  prefix: string;
  client: () => mqtt.MqttClient | null;
  isConnected: () => boolean;
  subscribe: <
    T extends Realtimed.Events["realtime"]["type"],
    P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
    A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
    TA extends `${T}.${A}`,
  >(
    target: TA,
    callback: (payload: P) => void,
  ) => VoidFunction;
  publish: <
    T extends Realtimed.Events["realtime"]["type"],
    P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
    A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
  >(
    topic: T,
    payload: P,
    action: A,
  ) => void;
};

export const RealtimeContext = createContext<MqttContextType>();

export type RealtimeProps = {
  children: JSX.Element;
  endpoint: string;
  authorizer: string;
  topic: string;
};

const globalEmitter = createGlobalEmitter<Realtimed.Events>(); // Create a global event emitter

export const Realtime = (props: RealtimeProps) => {
  const [client, setClient] = createSignal<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);

  const session = createAsync(() => getAuthenticatedSession());

  onMount(() => {
    if (isServer) {
      console.log("RealtimeContext: realtime is not available on the server");
      return;
    }

    const s = session();
    if (!s) return;
    const user = s.user;
    if (!user) return;
    const userid = user.id;

    // Connect to MQTT broker
    const mqttClient = mqtt.connect(`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`, {
      protocolVersion: 5,
      protocol: "wss",
      manualConnect: true,
      username: "", // !! KEEP EMPTY !!
      password: userid,
      clientId: `client_${window.crypto.randomUUID()}`,
      keepalive: 60,
      connectTimeout: 60 * 1000,
    });

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);
      setClient(mqttClient);
      mqttClient.subscribe(props.topic.concat("realtime"), { qos: 1 });
    });

    mqttClient.on("message", (receivedTopic, message) => {
      if (receivedTopic !== props.topic.concat("realtime")) return;
      const td = new TextDecoder();
      const pl = td.decode(message);
      let payload: any;
      let action: any;
      let t: any;
      try {
        const p = JSON.parse(pl);
        payload = p.payload;
        action = p.action;
        t = p.type;
      } catch {
        payload = {};
        action = "unknown";
        t = "unknown";
      }

      // Emit the message through the global emitter
      globalEmitter.emit("realtime", { payload, action, type: t });
    });

    mqttClient.on("error", (e) => {
      console.error(e);
    });

    mqttClient.connect();

    onCleanup(() => {
      if (mqttClient) {
        mqttClient.removeAllListeners();
        mqttClient.end();
        setIsConnected(false);
      }
    });
  });

  return (
    <RealtimeContext.Provider
      value={{
        client,
        isConnected,
        prefix: props.topic,
        // @ts-ignore
        subscribe: <
          T extends Realtimed.Events["realtime"]["type"],
          P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
          A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
          TA extends `${T}.${A}`,
        >(
          target: TA,
          callback: (payload: P) => void,
        ) => {
          const [type, action] = target.split(".") as [T, A];
          if (!type || !action) return;

          const unsubber = globalEmitter.on("realtime", (data) => {
            if (data.type === type && data.action === action) {
              callback(data.payload);
            }
          });
          return unsubber;
        },

        // @ts-ignore
        publish: <
          T extends Realtimed.Events["realtime"]["type"],
          P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
          A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
          TA extends `${T}.${A}`,
        >(
          target: TA,
          payload: P,
        ) => {
          const c = client();
          if (c) {
            const [topic, action] = target.split(".") as [T, A];
            if (!topic || !action) return;

            const message = JSON.stringify({ payload, action, type: topic });
            c.publish(props.topic.concat(topic), message, { qos: 1 });
          }
        },
      }}
    >
      {props.children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("RealtimeContext is not set");
  }

  return ctx;
};
