import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { AuthStack } from "./stacks/AuthStack";
import { DatabaseStack } from "./stacks/DatabaseStack";
// import { EventBusStack } from "./stacks/EventBusStack";
import { StorageStack } from "./stacks/StorageStack";
import { SolidStartStack } from "./stacks/SolidStartStack";

export default {
  config(_input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app
    .stack(DatabaseStack)
    .stack(ApiStack)
    // .stack(EventBusStack)
    .stack(StorageStack)
    .stack(AuthStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
