import { ApiHandler } from "sst/node/api";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";
import { getUser } from "./utils";

export const handler = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
      }),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
      }),
      statusCode: 200,
    };
  }
  const user_ = await User.findById(user.id);
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: user_ }),
    statusCode: 200,
  };
});
