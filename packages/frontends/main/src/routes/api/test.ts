import { Bucket } from "../../utils/bucket";
import { json } from "solid-start";

export const GET = async () => {
  // get all VITE_ prefixed env variables
  const files = await Bucket.listFiles();
  return json({ files });
};
