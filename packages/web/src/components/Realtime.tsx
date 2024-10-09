import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { Accessor, JSX, Setter } from "solid-js";
import mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

export const RealtimeContext = createContext<{
  client: Accessor<mqtt.MqttClient | null>;
  connected: Accessor<boolean>;
  setConnected: Setter<boolean>;
}>();

export type RealtimeProps = {
  children: JSX.Element;
  endpoint: string;
  authorizer: string;
};

const [client, setClient] = createSignal<mqtt.MqttClient | null>(null);

export const Realtime = (props: RealtimeProps) => {
  const [connected, setConnected] = createSignal(false);

  onMount(() => {
    console.log("connecting to ", `wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`);
    const c = mqtt.connect(`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`, {
      protocolVersion: 5,
      manualConnect: true,
      username: "", // !! KEEP EMPTY !!
      password: "PLACEHOLDER_TOKEN", // Passed as the token to the authorizer
      clientId: `client_${window.crypto.randomUUID()}`,
    });

    c.on("connect", (cp) => {
      setConnected(true);
      console.log("MQTT Client Identifier", cp.properties?.assignedClientIdentifier);
      setClient(c);
    });

    c.on("error", console.error);
  });

  onCleanup(() => {
    const c = client();
    if (c) {
      console.log("CLEANING REALTIME PROVIDER UP")
      c.end();
      setClient(null);
    }
  });

  return (
    <RealtimeContext.Provider
      value={{
        client,
        connected,
        setConnected,
      }}
    >
      {props.children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = <K extends keyof Realtimed.Events>(
  subscriber: K,
  fn: (payload: Realtimed.Events[K]["payload"]) => Promise<void>
) => {
  const ctx = useContext(RealtimeContext);

  if (!ctx) {
    throw new Error("RealtimeContext not found");
  }

  const client = ctx.client();

  if (!client) {
    return;
  }

  return {
    subscribe: () => {
      client.subscribe(subscriber, { qos: 1 });
      client.on("message", async (topic, payload) => {
        if (topic !== subscriber) {
          return;
        }
        const td = new TextDecoder();
        const data = td.decode(new Uint8Array(payload));
        try {
          const parsed = JSON.parse(data) as Realtimed.Events[K]["payload"];
          await fn(parsed);
        } catch (e) {
          console.error(e);
        }
      });

    },
    unsubscribe: () => {
      client.unsubscribe(subscriber);
    },
    publish: async (payload: Realtimed.Events[K]["payload"]) => {
      console.log("sending payload to topic:", subscriber)
      await client.publishAsync(subscriber, JSON.stringify(payload));
    },
    client,
  };
};
