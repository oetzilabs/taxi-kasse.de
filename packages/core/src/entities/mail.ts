import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import nm from "nodemailer";
import { Resource } from "sst";
import { MailBouncer } from "./mailbouncer";
import { MailComplaint } from "./mailcomplaint";

export module Email {
  const ses = new SESv2Client({});

  export async function sendLegacy(to: string, subject: string, body: string) {
    const bounceFound = await MailBouncer.findByEmail(to);
    const complaintFound = await MailComplaint.findByEmail(to);

    if (bounceFound && bounceFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to. Reason: bounce: ${bounceFound.type}(${bounceFound.t}).${bounceFound.st}`,
      );
    }
    if (complaintFound && complaintFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to. Reason: complaint:${complaintFound.type}(${complaintFound.t})`,
      );
    }

    console.log("sending email", subject, Resource.MailUsername.value, to);

    const transporter = nm.createTransport({
      service: "gmail",
      auth: {
        user: Resource.MailUsername.value,
        pass: Resource.MailPassword.value,
      },
    });

    const mailOptions = {
      from: Resource.MailUsername.value,
      to: to,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  export async function send(from: string, to: string, subject: string, body: string) {
    from = from + "@" + Resource.MainEmail.sender;
    const bounceFound = await MailBouncer.findByEmail(to);
    const complaintFound = await MailComplaint.findByEmail(to);

    if (bounceFound && bounceFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to. Reason: bounce: ${bounceFound.type}(${bounceFound.t}).${bounceFound.st}`,
      );
    }
    if (complaintFound && complaintFound.enabled) {
      throw new Error(
        `The email '${to}' is not allowed to be sent to. Reason: complaint:${complaintFound.type}(${complaintFound.t})`,
      );
    }

    console.log("sending email", subject, from, to);

    const result = await ses.send(
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
    if (result.MessageId) {
      console.log("Email sent successfully with MessageId:", result.MessageId);
    }
    return result;
  }
}
