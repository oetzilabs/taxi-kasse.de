import { APIGatewayProxyEventV2 } from "aws-lambda";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";

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
