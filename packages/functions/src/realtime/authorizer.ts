import { Realtimed } from "@taxikassede/core/src/entities/realtime";
import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

export const handler = realtime.authorizer(async (token) => {
  // Validate the token
  console.log(token);
  const prefix = `${Resource.App.name}/${Resource.App.stage}/` as const;
  const subscribe = Realtimed.Events.Subscribe(prefix);
  const publish = Realtimed.Events.Publish(prefix);

  // Return the topics to subscribe and publish
  return {
    subscribe,
    publish,
  };
});
