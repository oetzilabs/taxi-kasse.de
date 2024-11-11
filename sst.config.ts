/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "taxikassede",
      region: "eu-central-1",
      removal: input.stage === "production" ? "retain" : "remove",
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
    const { realtime, realtimeSubscriber } = await import("./stacks/Realtime");
    const auth = await import("./stacks/Auth");
    const api = await import("./stacks/Api");
    const solidStart = await import("./stacks/SolidStart");
    const { migrate, generate, studio, seed } = await import("./stacks/Database");
    const {
      // mainEmailWorker,
      mainEmail,
      bounceDeadLetterQueue,
      bounceQueue,
      bounceTopic,
      complaintDeadLetterQueue,
      complaintQueue,
      complaintTopic,
      deliveryDeadLetterQueue,
      deliveryQueue,
      deliveryTopic,
      emailBucket,
      mainEmailReceiptRule,
      mainEmailRuleSet,
      receivedEmailTopic,
      receivedEmailDeadLetterQueue,
      receivedEmailQueue,
      sendDeadLetterQueue,
      sendQueue,
      sendTopic,
    } = await import("./stacks/Email");

    return {
      // storageArn: storage.bucket.arn,
      // storageUrn: storage.bucket.urn,
      // notificationArn: notification.notifications.arn,
      // notificationUrn: notification.notifications.urn,
      // websocket: websocket.ws.url,
      realtimeUrn: realtime.urn,
      realtimeSubscriber: realtimeSubscriber.urn,

      // mainEmailWorker: mainEmailWorker.url,
      // mainEmailWorkerUrn: mainEmailWorker.urn,

      mainEmailUrn: mainEmail.urn,
      mainEmailSender: mainEmail.sender,
      bounceQueue: bounceQueue.arn,
      bounceDeadLetterQueue: bounceDeadLetterQueue.arn,
      bounceTopic: bounceTopic.arn,
      complaintQueue: complaintQueue.arn,
      complaintDeadLetterQueue: complaintDeadLetterQueue.arn,
      complaintTopic: complaintTopic.arn,
      deliveryDeadLetterQueue: deliveryDeadLetterQueue.arn,
      deliveryQueue: deliveryQueue.arn,
      deliveryTopic: deliveryTopic.arn,
      emailBucketArn: emailBucket.arn,
      emailBucketUrn: emailBucket.urn,
      mainEmailReceiptRuleArn: mainEmailReceiptRule.arn,
      mainEmailReceiptRuleName: mainEmailReceiptRule.name,
      mainEmailRuleSetArn: mainEmailRuleSet.arn,
      mainEmailRuleSetName: mainEmailRuleSet.ruleSetName,
      receivedEmailTopicArn: receivedEmailTopic.arn,
      receivedEmailTopicName: receivedEmailTopic.name,
      receivedEmailDeadLetterQueueArn: receivedEmailDeadLetterQueue.arn,
      receivedEmailQueueArn: receivedEmailQueue.arn,
      sendDeadLetterQueueArn: sendDeadLetterQueue.arn,
      sendQueueArn: sendQueue.arn,
      sendTopicArn: sendTopic.arn,

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
