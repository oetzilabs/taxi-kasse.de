import { APIGatewayProxyEventV2 } from "aws-lambda";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";
import { StatusCodes } from "http-status-codes";

export const getUser = async (x: APIGatewayProxyEventV2) => {
  const s = sessions.use();
  if (!s) return new Error("No session found");
  if (s.type !== "user") return new Error("Session is not a user session");

  const userid = s.properties.id;
  const user = await User.findById(userid);
  if (!user) {
    return new Error("No user found");
  }
  return user;
};

export const json = (body: any, statusCode: StatusCodes = StatusCodes.OK) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});

export const error = (message: string | Record<string, any>, statusCode: StatusCodes = StatusCodes.BAD_GATEWAY) => ({
  statusCode,
  headers: {
    "content-type": typeof message === "string" ? "text/plain" : "application/json",
  },
  body: typeof message === "string" ? message : JSON.stringify({ error: message }),
});

export const ok = () => ({
  statusCode: 200,
  headers: {
    "content-type": "application/json",
  },
});

export const text = (body: string, statusCode: StatusCodes = StatusCodes.OK) => ({
  statusCode,
  headers: {
    "content-type": "text/plain",
  },
  body,
});
