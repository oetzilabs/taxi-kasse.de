import { User } from "@taxikassede/core/entities/users";
import { StatusCodes } from "http-status-codes";
import { createSessionBuilder } from "sst/auth";

export const getUser = async (token: string) => {
  const session = await sessions.verify(token);
  if (!session) throw new Error("No session found");
  if (session.type !== "user") {
    throw new Error("Invalid session type");
  }
  const { id } = session.properties;
  if (!id) throw new Error("Invalid UserID in session");
  const user = await User.findById(id);
  if (!user) throw new Error("No session found");
  return user;
};

export const json = (input: unknown, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export const error = <T extends string | Record<string, any>>(error: T, statusCode = StatusCodes.BAD_REQUEST) => {
  const payload = typeof error === "string" ? { error } : error;
  return {
    statusCode,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
export const text = (input: string, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: input,
    headers: {
      "Content-Type": "text/plain",
    },
  };
};

export const sessions = createSessionBuilder<{
  user: {
    id: string;
    email: string;
  };
}>();
