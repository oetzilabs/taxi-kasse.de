/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
        cloudflare: true,
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
    const { migrate, generate, studio, seed } = await import("./stacks/Database");
    const { mainEmailWorker, mainEmail } = await import("./stacks/Email");

    return {
      // storageArn: storage.bucket.arn,
      // storageUrn: storage.bucket.urn,
      // notificationArn: notification.notifications.arn,
      // notificationUrn: notification.notifications.urn,
      // websocket: websocket.ws.url,
      mainEmailWorker: mainEmailWorker.url,
      mainEmailWorkerUrn: mainEmailWorker.urn,

      mainEmailUrn: mainEmail.urn,
      mainEmailSender: mainEmail.sender,

      migrateUrn: migrate.urn,
      generateUrn: generate.urn,
      seedUrn: seed.urn,
      dbStudioUrn: studio.urn,

      authUrl: auth.auth.authenticator.url,
      api: api.api.url,

      solidStartUrl: $dev ? "http://localhost:3000" : solidStart.solidStartApp.url,
    };
  },
});
