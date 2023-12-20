import { Company } from "@taxi-kassede/core/entities/company";
import { User } from "@taxi-kassede/core/entities/users";
import dayjs from "dayjs";
import { z } from "zod";
import { SessionResult } from "../../../../../functions/src/session";
import { CalendarResult } from "../../../../../functions/src/user";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const Users = {
  session: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/session`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<SessionResult>)
  ),
  statistics: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          from: z.date(),
          to: z.date().default(new Date()),
        }),
      ])
    )
    .implement(async (token, range) =>
      fetch(
        `${API_BASE}/user/statistics?from=${encodeURIComponent(
          dayjs(range.from).toISOString()
        )}&to=${encodeURIComponent(dayjs(range.to).toISOString())}`,
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
    ),
  get: z
    .function(z.tuple([z.string()]))
    .implement(async (id) => fetch(`${API_BASE}/user/${id}`).then((res) => res.json() as Promise<User.Frontend>)),
  listReports: z.function(z.tuple([z.string(), z.date()])).implement(async (token, date) =>
    fetch(`${API_BASE}/user/report/list?date=${dayjs(date.toISOString()).startOf("month").toISOString()}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof User.listReports>)
  ),
  Calendar: {
    get: z
      .function(
        z.tuple([
          z.string(),
          z.object({
            from: z.date(),
            to: z.date(),
          }),
        ])
      )
      .implement(async (token, range) =>
        fetch(
          `${API_BASE}/user/calendar?from=${encodeURIComponent(
            dayjs(range.from).toISOString()
          )}&to=${encodeURIComponent(dayjs(range.to).toISOString())}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json() as ReturnType<typeof User.calendar>)
      ),
  },
  Company: {
    search: z
      .function(z.tuple([z.string()]))
      .implement(async (query) =>
        fetch(`${API_BASE}/company/search?query=${encodeURIComponent(query)}`).then(
          (x) => x.json() as ReturnType<typeof Company.search>
        )
      ),
    // searchEmployees: z
    //   .function(z.tuple([z.string().uuid(), z.string()]))
    //   .implement(async (companyId, query) =>
    //     fetch(`${API_BASE}/company/${companyId}/user/search?${new URLSearchParams({ query }).toString()}`).then(
    //       (res) => res.json() as Promise<User.Frontend>
    //     )
    //   ),
    get: z.function(z.tuple([z.string()])).implement(async (token) =>
      fetch(`${API_BASE}/user/company`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json() as Promise<User.Frontend["company"]>)
    ),
  },
};

export const Companies = {
  all: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/company/all`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Company.all>)
  ),
};

export const Notices = {
  get: z.function(z.tuple([z.string()])).implement(
    async (token) =>
      Promise.resolve([
        {
          id: "1",
          title: "Notice",
          content: "This is a notice",
          createdAt: new Date(),
          dismissed: false,
        },
      ])
    // fetch(`${API_BASE}/notice`, {
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.getNotices>)
  ),
};
