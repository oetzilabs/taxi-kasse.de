import { Company } from "@taxi-kassede/core/entities/company";
import { User } from "@taxi-kassede/core/entities/users";
import dayjs from "dayjs";
import { z } from "zod";
import { SessionResult } from "../../../../../functions/src/session";
import { CalendarResult, UserGetReportsListResult } from "../../../../../functions/src/user";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const companyQueryZod = z.function(z.tuple([z.string()]));

export const company = companyQueryZod.implement(async (token) =>
  fetch(`${API_BASE}/user/company`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then(
      (res) =>
        res.json() as Promise<
          | { error: null; company: NonNullable<Awaited<ReturnType<typeof User.findById>>>["company"] }
          | {
              error: string;
              company: null;
            }
        >
    )
    .then((res) => {
      if (res.error) throw new Error(res.error);
      return { ...res, lastUpdated: new Date() };
    })
);

export const calendarQueryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  ])
);

export const calendar = calendarQueryZod.implement(async (token, range) =>
  fetch(
    `${API_BASE}/user/calendar?from=${encodeURIComponent(dayjs(range.from).toISOString())}&to=${encodeURIComponent(
      dayjs(range.to).toISOString()
    )}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.json() as Promise<CalendarResult>)
    .then((res) => {
      if (res.error) throw new Error(res.error);
      return { ...res, lastUpdated: new Date() };
    })
);

export const statisticsQueryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      from: z.date(),
      to: z.date().default(new Date()),
    }),
  ])
);

export const statistics = statisticsQueryZod.implement(async (token, range) =>
  fetch(
    `${API_BASE}/user/statistics?from=${encodeURIComponent(dayjs(range.from).toISOString())}&to=${encodeURIComponent(
      dayjs(range.to).toISOString()
    )}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.json() as ReturnType<typeof User.statistics>)
    .then((res) => {
      return { ...res, lastUpdated: new Date() };
    })
);

export const searchCompanyZod = z.function(z.tuple([z.string()]));

export const searchCompany = searchCompanyZod.implement(async (query) =>
  fetch(`${API_BASE}/company/search?query=${encodeURIComponent(query)}`).then(
    (x) => x.json() as ReturnType<typeof Company.search>
  )
);

export const sessionZod = z.function(z.tuple([z.string()]));

export const session = sessionZod.implement(async (token) =>
  fetch(`${API_BASE}/session`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<SessionResult>)
);

export const listReportsZod = z.function(z.tuple([z.string(), z.date()]));

export const listReports = listReportsZod.implement(async (token, date) =>
  fetch(`${API_BASE}/user/report/list?date=${dayjs(date.toISOString()).startOf("month").toISOString()}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<UserGetReportsListResult>)
);
