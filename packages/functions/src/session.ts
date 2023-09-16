import { ApiHandler } from "sst/node/api";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";

export const handler = ApiHandler(async (x) => {
  const authbearer = x.headers["authorization"];
  if (!authbearer) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      statusCode: 200,
    };
  }

  const session = sessions.verify(authbearer.replace("Bearer ", ""));
  if (!session || session.type !== "user") {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      statusCode: 200,
    };
  }
  const user = session.properties;
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      statusCode: 200,
    };
  }
  const profile = await User.findProfileById(user.id);
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: { ...user, profile } }),
    statusCode: 200,
  };
});
