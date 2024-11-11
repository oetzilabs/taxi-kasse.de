import type { Events as EventsModule } from "./events";
import type { Notifications } from "./notifications";
import type { Orders } from "./orders";
import type { Rides } from "./rides";
import { IoTDataPlaneClient, PublishCommand, PublishCommandOutput } from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";
import { Vehicles } from "./vehicles";

export module Realtimed {
  export type Unknown = {
    type: "unknown";
    action: "unknown";
    payload: any;
  };
  export type Payment = {
    type: "payment";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: {
      id: string;
    };
  };
  export type Ride = {
    type: "ride";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: Rides.Info;
  };
  export type Vehicle = {
    type: "vehicle";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: Vehicles.Info;
  };
  export type SystemNotification = {
    type: "systemnotification";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: Notifications.Info;
  };
  export type Hotspot = {
    type: "hotspot";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: Orders.HotspotInfo;
  };
  export type Event = {
    type: "event";
    action: "created" | "updated" | "deleted" | "unknown";
    payload: EventsModule.Info;
  };

  export type Events = {
    realtime: Payment | Ride | Vehicle | SystemNotification | Hotspot | Event | Unknown;
  };

  export const Events = {
    Subscribe: <T extends string>(prefix: T) =>
      (["realtime"] as ReadonlyArray<keyof Events>).map((s) => `${prefix}${s}` as const),
    Publish: <T extends string>(prefix: T) =>
      (["realtime"] as ReadonlyArray<keyof Events>).map((s) => `${prefix}${s}` as const),
  };

  export const sendToMqtt = async <
    RT extends Realtimed.Events["realtime"],
    T extends RT["type"],
    P extends Extract<RT, { type: T }>["payload"],
    A extends Extract<RT, { type: T }>["action"],
    TA extends `${T}.${A}`,
  >(
    target: TA,
    payload: P,
  ) => {
    let response_: PublishCommandOutput | null = null;
    // const endpoint = `https://${Resource.RealtimeServer.endpoint}?x-amz-customauthorizer-name=${Resource.RealtimeServer.authorizer}`;

    const [type, action] = target.split(".") as [T, A];
    if (!type || !action) return response_;

    const client = new IoTDataPlaneClient();
    try {
      const pl = { type, action, payload } as unknown as RT;
      const command = new PublishCommand({
        topic: `${Resource.App.name}/${Resource.App.stage}/realtime`, // Topic to publish to
        payload: Buffer.from(JSON.stringify(pl)), // Convert the payload to a JSON string
        qos: 1, // Quality of Service level (0 or 1)
      });
      const response = await client.send(command);
      response_ = response;
      // console.log("Payload sent successfully:", response);
    } catch (error) {
      console.error("Error sending payload to MQTT:", error);
    }

    client.destroy();
    return response_;
  };
}
