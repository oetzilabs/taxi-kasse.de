import { ApiHandler } from "sst/node/api";
import { sessions } from "./auth";

export const handler = ApiHandler(async (x) => {
  const session = sessions.use();
  const user = session.properties;
  return {
    body: JSON.stringify(user),
    statusCode: 200,
  };
});
