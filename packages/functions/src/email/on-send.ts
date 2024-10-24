import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSHandler } from "aws-lambda";
import { Resource } from "sst";

const s3 = new S3Client();

export const handler: SQSHandler = async (event) => {
  console.log("Received a Email Send Notification");
  // console.dir(event, { depth: Infinity });
  for (const record of event.Records) {
    if (!record.body) {
      continue;
    }
    const sqsMessage = JSON.parse(record.body);
    if (!sqsMessage.Message) {
      continue;
    }
    const snsMessage = JSON.parse(sqsMessage.Message);
    if (snsMessage.mail) {
      // Assuming snsMessage contains the necessary email data
      const emailContent = snsMessage.mail; // Adjust this according to your actual structure
      const emailId = emailContent.messageId; // Use a unique identifier for the email
      const emailBody = JSON.stringify(emailContent); // Convert to string if needed

      // Upload email to the S3 bucket
      const uploadParams = {
        Bucket: Resource.MainEmailBucket.name,
        Key: `send-emails/${emailId}.json`, // You can adjust the path and filename
        Body: emailBody,
        ContentType: "application/json",
      };

      const command = new PutObjectCommand(uploadParams);

      try {
        await s3.send(command);
        console.log(`Email uploaded successfully to ${uploadParams.Bucket}/${uploadParams.Key}`);
      } catch (error) {
        console.error("Error uploading email to S3:", error);
      }
    }
  }
  return;
};
