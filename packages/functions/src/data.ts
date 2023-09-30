import { ApiHandler, useCookies, useHeaders } from "sst/node/api";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";
import { Company } from "../../core/src/entities/company";

export const handler = ApiHandler(async (x) => {
  const authbearer = x.headers["authorization"];
  if (!authbearer) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No auth bearer found",
      }),
      statusCode: 200,
    };
  }

  const session = sessions.verify(authbearer.replace("Bearer ", ""));
  if (!session || session.type !== "user") {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No session found",
      }),
      statusCode: 200,
    };
  }
  let response = {
    user: null,
    company: null,
  } as any;
  const userid = session.properties.id;
  const user = await User.getCompanyData(userid);
  if (!user) {
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

  if (!user.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company found for user",
      }),
      statusCode: 200,
    };
  }

  if (!user.company) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company found for user",
      }),
      statusCode: 200,
    };
  }

  response.user = user;
  response.company = user.company;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response, null, 2),
  };
});
