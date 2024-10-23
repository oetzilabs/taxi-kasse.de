import { MailComplaint } from "@taxikassede/core/src/entities/mailcomplaint"; // Adjust the import path as necessary
import { SNSHandler } from "aws-lambda";
import dayjs from "dayjs";

export const handler: SNSHandler = async (event) => {
  // console.log("Received a Email Complaint Notification");
  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.Sns.Message);
    if (snsMessage.complaint) {
      const recipients = snsMessage.complaint.complainedRecipients;
      for (const r of recipients) {
        const complainedEmail = r.emailAddress;
        const complaintType = snsMessage.complaint.complaintFeedbackType;
        const capitalizedComplaintType = complaintType.charAt(0).toUpperCase() + complaintType.slice(1);

        const validComplaintType = MailComplaint.isValidComplaintType(capitalizedComplaintType);

        if (!validComplaintType.success) {
          // Handle as unknown complaint type
          await MailComplaint.create({
            feedbackId: snsMessage.complaint.feedbackId,
            email: complainedEmail,
            type: "Unknown",
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
          return;
        } else {
          console.log("Email already exists in the complaints table");
        }
        if (exists.enabled) {
          console.log("Email Complaint is enabled");
          return;
        }
      }
    }
  }

  return;
};
