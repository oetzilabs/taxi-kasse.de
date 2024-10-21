import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { JSX } from "solid-js";
import { createGlobalEmitter } from "@solid-primitives/event-bus";
import mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { isServer } from "solid-js/web";

type MqttContextType = {
  prefix: string;
  client: () => mqtt.MqttClient | null;
  isConnected: () => boolean;
  subscribe: <
    T extends Realtimed.Events["realtime"]["type"],
    P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
    A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
  >(
    topic: T,
    callback: (payload: P, action: A) => void,
  ) => void;
  unsubscribe: <T extends Realtimed.Events["realtime"]["type"]>(topic: T) => void;
  publish: <
    T extends Realtimed.Events["realtime"]["type"],
    P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
    A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
  >(
    topic: T,
    payload: P,
    action: A,
  ) => void;
  subscriptions: () => Set<Realtimed.Events["realtime"]["type"]>;
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
  const [subscriptions, setSubscriptions] = createSignal<Set<Realtimed.Events["realtime"]["type"]>>(new Set());
  const [isConnected, setIsConnected] = createSignal(false);

  onMount(() => {
    if (isServer) {
      console.log("RealtimeContext: realtime is not available on the server");
      return;
    }

    // Connect to MQTT broker
    const mqttClient = mqtt.connect(`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`, {
      protocolVersion: 5,
      manualConnect: true,
      username: "", // !! KEEP EMPTY !!
      password: "PLACEHOLDER_TOKEN",
      clientId: `client_${window.crypto.randomUUID()}`,
      keepalive: 60,
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
        subscriptions,
        // @ts-ignore
        subscribe: <
          T extends Realtimed.Events["realtime"]["type"],
          P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
          A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
        >(
          type: T,
          callback: (payload: P, action: A) => void,
        ) => {
          const subs = subscriptions();
          if (subs.has(type)) {
            console.log(`Subscription for '${type}' already exists`);
            return;
          }
          const unsubber = globalEmitter.on("realtime", (data) => {
            if (data.type === type) {
              callback(data.payload, data.action as A);
            }
          });
          setSubscriptions((s) => {
            s.add(type);
            return s;
          });
          onCleanup(() => {
            unsubber();
            setSubscriptions((s) => {
              s.delete(type);
              return s;
            });
          });
        },

        // @ts-ignore
        publish: <
          T extends Realtimed.Events["realtime"]["type"],
          P extends Extract<Realtimed.Events["realtime"], { type: T }>["payload"],
          A extends Extract<Realtimed.Events["realtime"], { type: T }>["action"],
        >(
          topic: T,
          payload: P,
          action: A,
        ) => {
          const c = client();
          if (c) {
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
