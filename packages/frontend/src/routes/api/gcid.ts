import { Config } from "sst/node/config";
import { json } from "solid-start";

export const GET = async () => {
  // get all VITE_ prefixed env variables
  return json({ gcid: Config.GOOGLE_CLIENT_ID });
};
