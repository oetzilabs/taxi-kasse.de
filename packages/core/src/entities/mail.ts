import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { Resource } from "sst";
import { MailBouncer } from "./mailbouncer";
import { MailComplaint } from "./mailcomplaint";

export module Email {
  const ses = new SESv2Client({});

  export async function send(from: string, to: string, subject: string, body: string) {
    from = from + "@" + Resource.MainEmail.sender;
    const bounceFound = await MailBouncer.findByEmail(to);
    const complaintFound = await MailComplaint.findByEmail(to);

    if (bounceFound && bounceFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to.Reason: bounce: ${bounceFound.type}(${bounceFound.t}).${bounceFound.st}`,
      );
    }
    if (complaintFound && complaintFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to. Reason: complaint:${complaintFound.type}(${complaintFound.t})`,
      );
    }

    console.log("sending email", subject, from, to);

    await ses.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [to],
        },
        Content: {
          Simple: {
            Body: {
              Text: {
                Data: body,
              },
            },
            Subject: {
              Data: subject,
            },
          },
        },
        FromEmailAddress: `Caby <${from}>`,
      }),
    );
  }
}
