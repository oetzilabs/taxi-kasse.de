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
    const hasBounce = bounceFound === undefined;
    const hasComplaint = complaintFound === undefined;
    if (!hasBounce || !hasComplaint) {
      console.log(hasBounce, hasComplaint);
      throw new Error(`The email '${to}' is not allowed to be sent to`);
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
