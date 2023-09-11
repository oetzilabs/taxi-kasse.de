import { EventBus, StackContext } from "sst/constructs";

export function EventBusStack({ stack, app }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  bus.subscribe("test.created", {
    handler: "packages/functions/src/events/test-created.handler",
  });

  return {
    bus,
  };
}
