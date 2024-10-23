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

// Subscribe to bounce notifications
bounceTopic.subscribe({
  handler: "packages/functions/src/email/on-bounce.handler",
  link: [...allSecrets, bounceTopic],
  url: true,
  copyFiles,
});

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

// Subscribe to complaint notifications
complaintTopic.subscribe({
  handler: "packages/functions/src/email/on-complaint.handler",
  link: [...allSecrets, complaintTopic],
  url: true,
  copyFiles,
});

// Email configuration
export const mainEmail = new sst.aws.Email("MainEmail", {
  sender: domain,
  dns: cf,
  dmarc: "v=DMARC1; p=none;",
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
  ],
});
