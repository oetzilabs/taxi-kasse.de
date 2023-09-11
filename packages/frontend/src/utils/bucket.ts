import { S3Client, ListObjectsV2Output, ListObjectsV2Command } from "@aws-sdk/client-s3";
export * as Bucket from "./bucket";

const s3 = new S3Client({ region: "eu-central-1" });

export async function listFiles(): Promise<ListObjectsV2Output["Contents"]> {
  try {
    const command = new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET });
    const data = await s3.send(command);
    return data.Contents ?? [];
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
