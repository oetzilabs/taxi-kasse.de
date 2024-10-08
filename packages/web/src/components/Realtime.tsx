import type { Accessor, JSX, Setter } from "solid-js";
import * as mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

const RealtimeContext = createContext<{
  client: Accessor<mqtt.MqttClient | null>;
  connected: Accessor<boolean>;
  setConnected: Setter<boolean>;
}>();

export type RealtimeProps = {
  children: JSX.Element;
  connectionString: string;
};

export const Realtime = (props: RealtimeProps) => {
  const [client, setClient] = createSignal<mqtt.MqttClient | null>(null);
  const [connected, setConnected] = createSignal(false);

  onMount(() => {
    const c = mqtt.connect(props.connectionString);
    c.on("connect", (cp) => {
      setConnected(true);
      console.log("MQTT Client Identifier", cp.properties?.assignedClientIdentifier);
      setClient(c);
    });
  });

  onCleanup(() => {
    const c = client();
    if (c) {
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

type RealtimeData = {
  "payment.received": {
    payload: {
      id: string;
    };
  };
  "payment.sent": {
    payload: any;
  };
  "ride.created": {
    payload: any;
  };
};

export const useRealtime = <K extends keyof RealtimeData>(
  subscriber: K,
  fn: (payload: RealtimeData[K]) => Promise<void>
) => {
  const ctx = useContext(RealtimeContext);

  if (!ctx) {
    throw new Error("RealtimeContext not found");
  }

  const client = ctx.client();

  if (!client) {
    throw new Error("MqttClient not found");
  }

  return {
    subscribe: () => {
      client.subscribe(subscriber);
      client.on("message", async (topic, payload) => {
        if (topic !== subscriber) {
          return;
        }
        const td = new TextDecoder();
        const data = td.decode(payload);
        try {
          const parsed = JSON.parse(data) as RealtimeData[K];
          await fn(parsed);
        } catch (e) {
          console.error(e);
        }
      });
    },
    unsubscribe: () => {
      client.unsubscribe(subscriber);
    },
    client,
  };
};
