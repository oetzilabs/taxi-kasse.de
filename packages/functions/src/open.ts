import { ApiHandler } from "sst/node/api";
import { User } from "@taxi-kassede/core/entities/users";

export const handler = ApiHandler(async (_evt) => {
  const _users = await User.countAll();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ users: _users }, null, 2),
  };
});
