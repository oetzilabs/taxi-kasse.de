import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { Accessor, JSX, Setter } from "solid-js";
import mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { isServer } from "solid-js/web";

type Topic = keyof Realtimed.Events;

type MqttContextType = {
  prefix: string;
  client: () => mqtt.MqttClient | null;
  isConnected: () => boolean;
  subscribe: <T extends Topic>(topic: T, callback: (payload: Realtimed.Events[T]["payload"]) => void) => void;
  unsubscribe: <T extends Topic>(topic: T) => void;
  publish: <T extends Topic>(topic: T, message: Realtimed.Events[T]["payload"]) => void;
  subscriptions: () => Topic[];
};

export const RealtimeContext = createContext<MqttContextType>();

export type RealtimeProps = {
  children: JSX.Element;
  endpoint: string;
  authorizer: string;
  topic: string;
};

export const Realtime = (props: RealtimeProps) => {
  const [client, setClient] = createSignal<mqtt.MqttClient | null>(null);
  const [subscriptions, setSubscriptions] = createSignal<Set<Topic>>(new Set());
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
      password: "PLACEHOLDER_TOKEN", // Passed as the token to the authorizer
      clientId: `client_${window.crypto.randomUUID()}`,
    });

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);
      setClient(mqttClient);
    });

    mqttClient.connect();

    onCleanup(() => {
      if (mqttClient) {
        mqttClient.removeAllListeners();
        mqttClient.end();
      }
    });
  });

  return (
    <RealtimeContext.Provider
      value={{
        client,
        isConnected,
        prefix: props.topic,
        subscriptions: () => Array.from(subscriptions().values()),
        subscribe: <T extends Topic>(topic: T, callback: (payload: Realtimed.Events[T]["payload"]) => void) => {
          const subs = subscriptions();
          if (subs.has(topic)) {
            console.log(`subscription for '${topic}' already has been setup`);
            return;
          }
          const c = client();
          if (c) {
            c.subscribe(props.topic.concat(topic), { qos: 1 });
            c.on("message", (receivedTopic, message) => {
              if (receivedTopic === props.topic.concat(topic)) {
                let payload: Realtimed.Events[T]["payload"];
                const td = new TextDecoder();
                const pl = td.decode(message);
                try {
                  payload = JSON.parse(pl);
                } catch {
                  payload = pl as Realtimed.Events[T]["payload"];
                }
                callback(payload);
              }
            });
            setSubscriptions((s) => {
              s.add(topic);
              return s;
            });
          }
        },
        unsubscribe: <T extends Topic>(topic: T) => {
          const subs = subscriptions();
          if (!subs.has(topic)) {
            return;
          }
          const c = client();
          if (c) {
            c.unsubscribe(props.topic.concat(topic));
            setSubscriptions((s) => {
              s.delete(topic);
              return s;
            });
          }
        },
        publish: <T extends Topic>(topic: T, message: Realtimed.Events[T]["payload"]) => {
          const c = client();
          if (c) {
            const payload = typeof message === "object" ? JSON.stringify(message) : message.toString();
            c.publish(props.topic.concat(topic), payload, { qos: 1 });
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
