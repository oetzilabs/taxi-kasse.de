import { MailBouncer } from "@taxikassede/core/src/entities/mailbouncer";
import { SNSHandler } from "aws-lambda";

export const handler: SNSHandler = async (event) => {
  // console.log("Received a Email Bounce Notification");
  for (const record of event.Records) {
    // const snsMessage = JSON.parse(record.Sns.Message);
    // console.log("Received bounce message:", snsMessage);

    const snsMessage = JSON.parse(record.Sns.Message);
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
          return;
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
          return;
        }
        const bType = `${validBounceType.output}.${validBounceSubType.output}` as MailBouncer.CombinedType<
          typeof validBounceType.output
        >;
        exists = await MailBouncer.findByEmail(bouncedEmail);
        if (!exists) {
          exists = await MailBouncer.create({ email: bouncedEmail, type: bType, t: bounceType, st: bounceSubType });
          return;
        }
        if (exists.enabled) {
          console.log("Email Bounce is enabled");
          return;
        }
      }
    }
    return;
  }
};
