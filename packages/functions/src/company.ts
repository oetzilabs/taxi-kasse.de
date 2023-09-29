import { ApiHandler, useBody, useCookies, useFormData, useFormValue, useHeaders, useQueryParams } from "sst/node/api";
import { sessions } from "./auth";
import { User } from "@taxi-kassede/core/entities/users";
import { Company } from "../../core/src/entities/company";
import { getUser } from "./utils";
import dayjs from "dayjs";

export const create = ApiHandler(async (x) => {
  const user = await getUser(x);

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
  const body = useBody();
  const data = JSON.parse(body ?? "{}");
  if (!data.email) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No email provided",
      }),
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

  if (!data.email) {
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

  if (!data.name) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company name provided",
      }),
    };
  }

  const company = await Company.create({
    name: data.name,
    ownerId: user.id,
    email: data.email,
    phoneNumber: data.phonenumber,
  });

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

export const statistics = ApiHandler(async (x) => {
  const user = await getUser(x);
  const params = useQueryParams();
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
        statistics: [],
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
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company found",
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  const statistics = await Company.statistics(user_.companyId, {
    from: dayjs(params.from).toDate(),
    to: dayjs(params.to).toDate(),
  });
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ statistics }),
    statusCode: 200,
  };
});

export const search = ApiHandler(async (x) => {
  const query = useQueryParams().query;
  if (!query) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No query provided",
      }),
      statusCode: 200,
    };
  }
  const companies = await Company.search(query);
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companies,
    }),
    statusCode: 200,
  };
});

export const listAll = ApiHandler(async (x) => {
  const companies = await Company.all();
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companies,
    }),
    statusCode: 200,
  };
});
