import { Notifications } from "./notifications";

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
  };

  export const Events = {
    Subscribe: <T extends string>(prefix: T) =>
      (
        ["payment.sent", "payment.received", "ride.created", "systemnotification.created"] as ReadonlyArray<
          keyof Events
        >
      ).map((s) => `${prefix}${s}` as const),
    Publish: <T extends string>(prefix: T) =>
      (
        ["payment.sent", "payment.received", "ride.created", "systemnotification.created"] as ReadonlyArray<
          keyof Events
        >
      ).map((s) => `${prefix}${s}` as const),
  };
}