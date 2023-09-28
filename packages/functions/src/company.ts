import { ApiHandler, useCookies, useFormData, useFormValue, useHeaders } from "sst/node/api";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";
import { Company } from "../../core/src/entities/company";
import { getUser } from "./utils";

export const create = ApiHandler(async (x) => {
  const company_email = useFormValue("company_email");
  const user = await getUser(x).catch((e: Error) => {
    return null;
  });
  if (user instanceof Error) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
      }),
    };
  }
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

  if (user.companyId) {
    // user already has a company
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "User already has a company",
      }),
    };
  }

  if (!company_email) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company email provided",
      }),
    };
  }

  const company = await Company.create({ name: "test", ownerId: user.id, email: company_email });

  if (!company) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Could not create company",
      }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        company,
      },
      null,
      2
    ),
  };
});
