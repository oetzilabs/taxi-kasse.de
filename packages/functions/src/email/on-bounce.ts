import { MailBouncer } from "@taxikassede/core/src/entities/mailbouncer";
import { SNSHandler, SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) => {
  // console.log("Received a Email Bounce Notification");
  for (const record of event.Records) {
    if (!record.body) {
      continue;
    }
    const sqsMessage = JSON.parse(record.body);
    if (!sqsMessage.Message) {
      continue;
    }
    const snsMessage = JSON.parse(sqsMessage.Message);
    if (snsMessage.bounce) {
      const recipients = snsMessage.bounce.bouncedRecipients;
      for (const r of recipients) {
        const bouncedEmail = r.emailAddress;
        const bounceType = snsMessage.bounce.bounceType;
        const bounceSubType = snsMessage.bounce.bounceSubType;

        const validBounceType = MailBouncer.isValidBounceType(bounceType);
        let exists = null;
        if (!validBounceType.success) {
          // unknown issue, handle as if its undetermined, but pass the bt and bst
          exists = await MailBouncer.create({
            email: bouncedEmail,
            type: "Undetermined",
            t: bounceType,
            st: bounceSubType,
          });
          continue;
        }
        const validBounceSubType = MailBouncer.isValidBounceSubType(validBounceType.output, bounceSubType);
        if (!validBounceSubType.success) {
          // unknown issue, handle as if its undetermined, but pass the bt and bst
          exists = await MailBouncer.create({
            email: bouncedEmail,
            type: "Undetermined",
            t: bounceType,
            st: bounceSubType,
          });
          continue;
        }
        const bType = `${validBounceType.output}.${validBounceSubType.output}` as MailBouncer.CombinedType<
          typeof validBounceType.output
        >;
        exists = await MailBouncer.findByEmail(bouncedEmail);
        if (!exists) {
          exists = await MailBouncer.create({ email: bouncedEmail, type: bType, t: bounceType, st: bounceSubType });
          continue;
        }
        if (exists.enabled) {
          console.log("Email Bounce is enabled");
          continue;
        }
      }
    }
  }
};
