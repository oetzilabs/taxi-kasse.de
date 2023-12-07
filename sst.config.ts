import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { SolidStartStack } from "./stacks/SolidStartStack";
import { StorageStack } from "./stacks/StorageStack";
import { DNSStack } from "./stacks/DNSStack";

export default {
  config(_input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.setDefaultRemovalPolicy("destroy");
    app
      //
      .stack(DNSStack)
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
