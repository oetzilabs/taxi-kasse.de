import { MailComplaint } from "@taxikassede/core/src/entities/mailcomplaint"; // Adjust the import path as necessary
import { SNSHandler } from "aws-lambda";
import dayjs from "dayjs";

export const handler: SNSHandler = async (event) => {
  console.log("Received a Email Complaint Notification");
  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.Sns.Message);
    const recipients = snsMessage.complaint.complainedRecipients;
    for (const r of recipients) {
      const complainedEmail = r.emailAddress;
      const complaintType = snsMessage.complaint.complaintType;

      const validComplaintType = MailComplaint.isValidComplaintType(complaintType);

      if (!validComplaintType.success) {
        // Handle as unknown complaint type
        await MailComplaint.create({
          feedbackId: snsMessage.complaint.feedbackId,
          email: complainedEmail,
          type: "Unknown", // or whatever is suitable for undetermined complaints
          t: complaintType,
          complaintTimestamp: dayjs(snsMessage.complaint.timestamp).toDate(),
        });
        return;
      }

      const exists = await MailComplaint.findByEmail(complainedEmail);
      if (!exists) {
        // Create a new record if it doesn't exist
        await MailComplaint.create({
          feedbackId: snsMessage.complaint.feedbackId,
          email: complainedEmail,
          type: validComplaintType.output, // Use validated complaint type
          t: complaintType,
          complaintTimestamp: dayjs(snsMessage.complaint.timestamp).toDate(),
        });
      } else {
        console.log("Email already exists in the complaints table");
      }
    }
  }
};
