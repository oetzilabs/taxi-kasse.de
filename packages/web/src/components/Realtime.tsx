import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { Accessor, JSX, Setter } from "solid-js";
import mqtt from "mqtt";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { isServer } from "solid-js/web";

export const RealtimeContext = createContext<{
  client: Accessor<mqtt.MqttClient | null>;
  connected: Accessor<boolean>;
  setConnected: Setter<boolean>;
  prefix: string;
}>();

export type RealtimeProps = {
  children: JSX.Element;
  endpoint: string;
  authorizer: string;
  topic: string;
};

const [client, setClient] = createSignal<mqtt.MqttClient | null>(null);

export const Realtime = (props: RealtimeProps) => {
  const [connected, setConnected] = createSignal(false);

  onMount(() => {
    const c = mqtt.connect(`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`, {
      protocolVersion: 5,
      manualConnect: true,
      username: "", // !! KEEP EMPTY !!
      password: "PLACEHOLDER_TOKEN", // Passed as the token to the authorizer
      clientId: `client_${window.crypto.randomUUID()}`,
    });
    c.on("connect", (cp) => {
      setConnected(true);
    });
    c.on("disconnect", (cp) => {
      setConnected(false);
    });

    c.on("error", console.error);

    console.log("connecting to mqtt");
    c.connect();

    setClient(c);

    onCleanup(() => {
      const c = client();
      if (!c) {
        console.log("no mqtt client to cleanup");
        return;
      }
      console.log("CLEANING REALTIME PROVIDER UP");
      c.end();
      setClient(null);
    });
  });

  return (
    <RealtimeContext.Provider
      value={{
        client,
        connected,
        setConnected,
        prefix: props.topic,
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
  // return {
  //   subscribe: () => {
  //     client?.subscribe(ctx?.prefix + subscriber, { qos: 1 });
  //     client?.on("message", async (topic, payload) => {
  //       console.log({ topic });
  //       if (topic !== ctx?.prefix + subscriber) {
  //         return;
  //       }
  //       const td = new TextDecoder();
  //       const data = td.decode(new Uint8Array(payload));
  //       try {
  //         const parsed = JSON.parse(data) as Realtimed.Events[K]["payload"];
  //         fn(parsed);
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     });
  //     console.log("subscribed to: ", ctx?.prefix + subscriber);
  //   },
  //   unsubscribe: () => {
  //     client?.unsubscribe(ctx?.prefix + subscriber);
  //   },
  //   publish: (payload: Realtimed.Events[K]["payload"]) => {
  //     console.log("sending payload to topic:", ctx?.prefix + subscriber, payload);
  //     client?.publish(ctx?.prefix + subscriber, JSON.stringify(payload));
  //   },
  //   client,
  // };
};
