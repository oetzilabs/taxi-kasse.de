import { json } from "../utils";

export const handler = async (...args: any[]) => {
  console.log({ args });

  return json({ status: "ok" });
};
