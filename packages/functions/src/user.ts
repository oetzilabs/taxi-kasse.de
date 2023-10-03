import { User } from "@taxi-kassede/core/entities/users";
import { ApiHandler, useBody, useQueryParams } from "sst/node/api";
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

export type CalendarResult = {
  error: string | null;
  calendar: Awaited<ReturnType<typeof User.calendar>> | null;
};

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
      } as CalendarResult),
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
      } as CalendarResult),
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
      } as CalendarResult),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "User has no company",
        calendar: null,
      } as CalendarResult),
      statusCode: 200,
    };
  }
  const dateRange = useQueryParams();
  const from = dayjs(dateRange.from).toDate();
  const to = dayjs(dateRange.to).toDate();
  const calendar = await User.calendar(user_.id, user_.companyId, { from, to });

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: null, calendar } as CalendarResult),
    statusCode: 200,
  };
});

export type CreateDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.createDayEntry>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
    };

export const createDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as CreateDayEntryResult),
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
        entry: null,
      } as CreateDayEntryResult),
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
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const date = dayjs(data.date).toDate();
  const e: Awaited<ReturnType<typeof User.createDayEntry>> | Error = await User.createDayEntry(user_.id, {
    date,
    total_distance: data.total_distance,
    driven_distance: data.driven_distance,
    tour_count: data.tour_count,
    cash: data.cash,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 422,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
    } as CreateDayEntryResult),
    statusCode: 200,
  };
});

export type UpdateDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
      changes: Partial<NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
      changes: null;
    };

export const updateDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as UpdateDayEntryResult),
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
        entry: null,
      } as UpdateDayEntryResult),
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
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const oldEntry = await User.dayEntry(user_.id, { id: data.id });
  if (!oldEntry) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: `No entry found with id ${data.id}`,
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const e: Awaited<ReturnType<typeof User.updateDayEntry>> | Error = await User.updateDayEntry(user_.id, {
    id: data.id,
    total_distance: data.total_distance,
    driven_distance: data.driven_distance,
    tour_count: data.tour_count,
    cash: data.cash,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 422,
    };
  }

  let changes = {} as Partial<NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>>;

  Object.keys(data).forEach((key) => {
    let k = key as keyof NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
    if (data[k] !== oldEntry[k]) {
      changes[k] = data[k];
    }
  });

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
      changes: changes,
    } as UpdateDayEntryResult),
    statusCode: 200,
  };
});

export type DeleteDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
    };

export const deleteDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as DeleteDayEntryResult),
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
        entry: null,
      } as DeleteDayEntryResult),
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
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const e: Awaited<ReturnType<typeof User.deleteDayEntry>> | Error = await User.deleteDayEntry(user_.id, {
    id: data.id,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 422,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
    } as DeleteDayEntryResult),
    statusCode: 200,
  };
});
