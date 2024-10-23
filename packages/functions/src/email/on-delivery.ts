import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SNSHandler } from "aws-lambda";
import { Resource } from "sst";

const s3 = new S3Client();

export const handler: SNSHandler = async (event) => {
  // console.log("Received a Email Bounce Notification");
  // console.dir(event, { depth: Infinity });
  for (const record of event.Records) {
    // const snsMessage = JSON.parse(record.Sns.Message);
    // console.log("Received bounce message:", snsMessage);

    const snsMessage = JSON.parse(record.Sns.Message);
    console.dir(snsMessage, { depth: Infinity });
    // Assuming snsMessage contains the necessary email data
    const emailContent = snsMessage.mail; // Adjust this according to your actual structure
    const emailId = emailContent.messageId; // Use a unique identifier for the email
    const emailBody = JSON.stringify(emailContent); // Convert to string if needed

    // Upload email to the S3 bucket
    const uploadParams = {
      Bucket: Resource.MainEmailBucket.name,
      Key: `delivered-emails/${emailId}.json`, // You can adjust the path and filename
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
    return;
  }
  return;
};
