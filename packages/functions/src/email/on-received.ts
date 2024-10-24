import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSHandler } from "aws-lambda";
import { Resource } from "sst";

const s3Client = new S3Client({});

export const handler: SQSHandler = async (event) => {
  // console.log("Received a Email Received Notification");
  for (const record of event.Records) {
    if (!record.body) {
      continue;
    }
    const sqsMessage = JSON.parse(record.body);
    if (!sqsMessage.Message) {
      continue;
    }
    const snsMessage = JSON.parse(sqsMessage.Message);
    // console.dir(snsMessage, { depth: Infinity });
    if (snsMessage.mail) {
      // Assuming snsMessage contains the necessary email data
      const emailContent = snsMessage.mail; // Adjust this according to your actual structure
      const emailId = emailContent.messageId; // Use a unique identifier for the email
      const emailBody = JSON.stringify(emailContent); // Convert to string if needed

      // Upload email to the S3 bucket
      const uploadParams = {
        Bucket: Resource.MainEmailBucket.name,
        Key: `received-emails/${emailId}.json`, // You can adjust the path and filename
        Body: emailBody,
        ContentType: "application/json",
      };

      const command = new PutObjectCommand(uploadParams);

      try {
        await s3Client.send(command);
        console.log(`Email uploaded successfully to ${uploadParams.Bucket}/${uploadParams.Key}`);
      } catch (error) {
        console.error("Error uploading email to S3:", error);
      }
    }
  }
  return;
};
