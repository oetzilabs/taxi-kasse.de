/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        cloudflare: {
          version: "5.24.1",
        },
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    await import("./stacks/Secrets");
    await import("./stacks/Domain");
    // const storage = await import("./stacks/Storage");
    // const notification = await import("./stacks/Notification");
    // const websocket = await import("./stacks/Websocket");
    const auth = await import("./stacks/Auth");
    const api = await import("./stacks/Api");
    const solidStart = await import("./stacks/SolidStart");
    const { migrate, generate, studio } = await import("./stacks/Database");

    return {
      // storageArn: storage.bucket.arn,
      // storageUrn: storage.bucket.urn,
      // notificationArn: notification.notifications.arn,
      // notificationUrn: notification.notifications.urn,
      // websocket: websocket.ws.url,
      migrateUrn: migrate.urn,
      generateUrn: generate.urn,
      dbStudioUrn: studio.urn,
      authUrl: auth.auth.authenticator.url,
      api: api.api.url,
      solidStartUrl: $dev ? "http://localhost:3000" : solidStart.solidStartApp.url,
    };
  },
});
