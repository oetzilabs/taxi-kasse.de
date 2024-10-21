import type { Events as EventsModule } from "./events";
import type { Notifications } from "./notifications";
import type { Orders } from "./orders";
import { IoTDataPlaneClient, PublishCommand, PublishCommandOutput } from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";

export module Realtimed {
  export type Events = {
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
    "systemnotification.created": {
      payload: Notifications.Info;
    };
    "hotspot.created": {
      payload: Orders.HotspotInfo;
    };
    "event.created": {
      payload: EventsModule.Info;
    };
    "event.updated": {
      payload: EventsModule.Info;
    };
    "event.deleted": {
      payload: EventsModule.Info;
    };
  };

  export const Events = {
    Subscribe: <T extends string>(prefix: T) =>
      (
        [
          "payment.sent",
          "payment.received",
          "ride.created",
          "systemnotification.created",
          "hotspot.created",
          "event.created",
          "event.updated",
          "event.deleted",
        ] as ReadonlyArray<keyof Events>
      ).map((s) => `${prefix}${s}` as const),
    Publish: <T extends string>(prefix: T) =>
      (
        [
          "payment.sent",
          "payment.received",
          "ride.created",
          "systemnotification.created",
          "hotspot.created",
          "event.created",
          "event.updated",
          "event.deleted",
        ] as ReadonlyArray<keyof Events>
      ).map((s) => `${prefix}${s}` as const),
  };

  export const sendToMqtt = async (topic: keyof Events, payload: any) => {
    let response_: PublishCommandOutput | null = null;
    // const endpoint = `https://${Resource.RealtimeServer.endpoint}?x-amz-customauthorizer-name=${Resource.RealtimeServer.authorizer}`;
    const client = new IoTDataPlaneClient();

    try {
      const command = new PublishCommand({
        topic: `${Resource.App.name}/${Resource.App.stage}/${topic}`, // Topic to publish to
        payload: Buffer.from(JSON.stringify(payload)), // Convert the payload to a JSON string
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
