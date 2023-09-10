import { EventHandler } from "sst/node/event-bus";
import { Test } from "@taxi-kassede/core/test";

export const handler = EventHandler(Test.Events.Created, async (evt) => {
  console.log("Todo created", evt);
});
