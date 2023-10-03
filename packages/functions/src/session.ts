import { ApiHandler } from "sst/node/api";
import { User } from "@taxi-kassede/core/entities/users";
import { getUser } from "./utils";
import { StatusCodes } from "http-status-codes";

export type SessionResult =
  | {
      success: true;
      user: Awaited<ReturnType<typeof User.findById>>;
    }
  | {
      success: false;
      error: string;
    };

export const handler = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
      } as SessionResult),
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
      } as SessionResult),
      statusCode: StatusCodes.UNAUTHORIZED,
    };
  }
  const user_ = await User.findById(user.id);
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, user: user_ } as SessionResult),
    statusCode: StatusCodes.OK,
  };
});
