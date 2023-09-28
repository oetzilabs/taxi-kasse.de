import { User } from "@taxi-kassede/core/entities/users";
import { ApiHandler } from "sst/node/api";

export const create = ApiHandler(async (_evt) => {
  const u = await User.create({ name: "test", email: "oezguerisbert@gmail.com" }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({ user: u }, null, 2),
  };
});
