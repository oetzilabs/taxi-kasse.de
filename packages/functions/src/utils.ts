import { APIGatewayProxyEventV2 } from "aws-lambda";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";

export const getUser = async (x: APIGatewayProxyEventV2) => {
  const authbearer = x.headers["authorization"];
  if (!authbearer) {
    return new Error("No auth bearer found");
  }

  const session = sessions.verify(authbearer.replace("Bearer ", ""));
  if (!session || session.type !== "user") {
    return new Error("No session found");
  }

  const userid = session.properties.id;
  const user = await User.findById(userid);
  if (!user) {
    return new Error("No user found");
  }
  return user;
};
