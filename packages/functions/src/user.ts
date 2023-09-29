import { User } from "@taxi-kassede/core/entities/users";
import { ApiHandler, useQueryParams } from "sst/node/api";
import { getUser } from "./utils";
import dayjs from "dayjs";

export const create = ApiHandler(async (_evt) => {
  const u = await User.create({ name: "test", email: "oezguerisbert@gmail.com" }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({ user: u }, null, 2),
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
  const statistics = await User.statistics(user_.companyId, {
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

export const hasCompany = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        hasCompany: false,
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
        success: false,
        error: "No user found",
        hasCompany: false,
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
        success: false,
        error: "No user found",
        hasCompany: false,
      }),
      statusCode: 200,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, hasCompany: !!user_.companyId }),
    statusCode: 200,
  };
});

export const company = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        company: null,
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
        success: false,
        error: "No user found",
        company: null,
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
        company: null,
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
        company: null,
      }),
      statusCode: 200,
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: null, company: user.company }),
    statusCode: 200,
  };
});

export const listAll = ApiHandler(async (x) => {
  const users = await User.all();
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, users }),
    statusCode: 200,
  };
});

export const calendar = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
        calendar: null,
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
        calendar: null,
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
        calendar: null,
      }),
      statusCode: 200,
    };
  }
  const dateRange = useQueryParams();
  const from = dayjs(dateRange.from).toDate();
  const to = dayjs(dateRange.to).toDate();
  const calendar = await User.calendar(user_.id, { from, to });

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: null, calendar }),
    statusCode: 200,
  };
});
