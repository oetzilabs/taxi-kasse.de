import { cf, domain, zone } from "./Domain";
import { allSecrets } from "./Secrets";

// Copy files to the deployment package
const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

// SNS Topic for bounce notifications
export const bounceTopic = new sst.aws.SnsTopic("MainEmailBouncerTopic", {
  fifo: false,
});

// Dead Letter Queue for bounces
export const bounceDeadLetterQueue = new sst.aws.Queue("MainEmailBouncerDLQ");

// Queue for bounce processing
export const bounceQueue = new sst.aws.Queue("MainEmailBouncerQueue", {
  dlq: bounceDeadLetterQueue.arn,
  fifo: false,
});

bounceQueue.subscribe({
  handler: "packages/functions/src/email/on-bounce.handler",
  link: [...allSecrets, bounceTopic],
  url: true,
  copyFiles,
});

// Subscribe to bounce notifications
bounceTopic.subscribeQueue(bounceQueue.arn);

// SNS Topic for complaint notifications
export const complaintTopic = new sst.aws.SnsTopic("MainEmailComplaintTopic", {
  fifo: false,
});

// Dead Letter Queue for complaints
export const complaintDeadLetterQueue = new sst.aws.Queue("MainEmailComplaintDLQ");

// Queue for complaint processing
export const complaintQueue = new sst.aws.Queue("MainEmailComplaintQueue", {
  dlq: complaintDeadLetterQueue.arn,
  fifo: false,
});

complaintQueue.subscribe({
  handler: "packages/functions/src/email/on-complaint.handler",
  link: [...allSecrets, complaintTopic],
  url: true,
  copyFiles,
});

// Subscribe to complaint notifications
complaintTopic.subscribeQueue(complaintQueue.arn);

// S3 Bucket for storing outbound emails
export const emailBucket = new sst.aws.Bucket("MainEmailBucket", {
  versioning: true,
});

// SNS Topic for delivery notifications
export const deliveryTopic = new sst.aws.SnsTopic("MainEmailDeliveryTopic", {
  fifo: false,
});

// Dead Letter Queue for deliveries
export const deliveryDeadLetterQueue = new sst.aws.Queue("MainEmailDeliveryDLQ");

// Queue for delivery processing
export const deliveryQueue = new sst.aws.Queue("MainEmailDeliveryQueue", {
  dlq: deliveryDeadLetterQueue.arn,
  fifo: false,
});

deliveryQueue.subscribe({
  handler: "packages/functions/src/email/on-delivery.handler",
  link: [...allSecrets, deliveryTopic, emailBucket],
  url: true,
  copyFiles,
});

// Subscribe to delivery notifications
deliveryTopic.subscribeQueue(deliveryQueue.arn);

// SNS Topic for delivery notifications
export const sendTopic = new sst.aws.SnsTopic("MainEmailSendTopic", {
  fifo: false,
});

// Dead Letter Queue for deliveries
export const sendDeadLetterQueue = new sst.aws.Queue("MainEmailSendDLQ");

// Queue for send processing
export const sendQueue = new sst.aws.Queue("MainEmailSendQueue", {
  dlq: sendDeadLetterQueue.arn,
  fifo: false,
});

sendQueue.subscribe({
  handler: "packages/functions/src/email/on-send.handler",
  link: [...allSecrets, sendTopic, emailBucket],
  url: true,
  copyFiles,
});

// Subscribe to send notifications
sendTopic.subscribeQueue(sendQueue.arn);

// Email configuration
export const mainEmail = new sst.aws.Email("MainEmail", {
  sender: domain,
  dns: cf,
  dmarc: '"v=DMARC1; p=none;"',
  events: [
    {
      name: "OnBounce",
      types: ["bounce"],
      topic: bounceTopic.arn,
    },
    {
      name: "OnComplaint",
      types: ["complaint"],
      topic: complaintTopic.arn,
    },
    {
      name: "OnDelivery",
      types: ["delivery"],
      topic: deliveryTopic.arn,
    },
    {
      name: "OnSend",
      types: ["send"],
      topic: sendTopic.arn,
    },
  ],
});

export const receivedEmailDeadLetterQueue = new sst.aws.Queue("MainEmailReceivedDLQ");

export const receivedEmailQueue = new sst.aws.Queue("MainEmailReceivedQueue2", {
  dlq: receivedEmailDeadLetterQueue.arn,
  fifo: false,
});

export const receivedEmailTopic = new sst.aws.SnsTopic("MainEmailReceivedTopic2", {
  fifo: false,
});

receivedEmailQueue.subscribe({
  handler: "packages/functions/src/email/on-received.handler",
  link: [...allSecrets, receivedEmailTopic, emailBucket],
  url: true,
});

receivedEmailTopic.subscribeQueue(receivedEmailQueue.arn);

export const mainEmailRuleSet = new aws.ses.ReceiptRuleSet("MainEmailReceiptRuleSet", {
  ruleSetName: "MainEmailRuleSet",
});

export const mainEmailReceiptRule = new aws.ses.ReceiptRule("storeInS3Rule", {
  ruleSetName: mainEmailRuleSet.ruleSetName,
  recipients: [$interpolate`info@${domain}`], // Change to your domain
  enabled: true,
  snsActions: [
    {
      position: 1,
      topicArn: receivedEmailTopic.arn,
    },
  ],
});
