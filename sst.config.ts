import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { SolidStartStack } from "./stacks/SolidStartStack";
import { StorageStack } from "./stacks/StorageStack";

export default {
  config(_input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(StorageStack).stack(ApiStack).stack(SolidStartStack);
  },
} satisfies SSTConfig;
