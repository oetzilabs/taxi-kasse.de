import { SSTConfig } from "sst";
import { API } from "./stacks/Api";
import { SolidStart } from "./stacks/SolidStart";
import { Storage } from "./stacks/Storage";
import { Domain } from "./stacks/Domain";
import { Secrets } from "./stacks/Secrets";
import { Notification } from "./stacks/Notification";
import { WebSocket } from "./stacks/WebSocket";

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
      .stack(Domain)
      .stack(Secrets)
      .stack(Storage)
      .stack(Notification)
      .stack(WebSocket)
      .stack(API)
      .stack(SolidStart);
  },
} satisfies SSTConfig;
