import { json } from "../utils";

export const handler = async (event: any, context: any) => {
  return json({ status: "ok" });
};
