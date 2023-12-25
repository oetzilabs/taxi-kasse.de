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
          type: "info",
          title: "Tech Demo Notice",
          content: `
# This is a tech demo notice (mdx) with large amounts of text. 

This project will be launched at some time, the ETA of it is currently not known. I'm currently working on it in my free time, and I'm not sure when it will be done. There is a lot of work to be done, and I'm not sure how long it will take. 

## As for now these are the features that are out:
- [x] User Authentication
- [x] Calendar Management

## These are the features that are planned for the future:

- [ ] Company Management
- [ ] Employee Management
- [ ] Notice Management
- [ ] Notification Management

------

Do you have any questions regarding this notice? [Contact us](/contact/notice/1)`,
          createdAt: dayjs().subtract(1, "day").toDate(),
          dismissed: false,
          author: {
            name: "Admin",
          },
        },
        {
          id: "2",
          type: "error",
          author: {
            name: "Admin",
          },
          dismissed: false,
          createdAt: dayjs().subtract(4, "day").toDate(),
          title: "Demo Notice | Error",
          content: `
# This is a demo notice (mdx) with large amounts of text.

Warning: This notice is **important**. Please read it.
`,
        },
        {
          id: "3",
          type: "warning",
          author: {
            name: "Admin",
          },
          dismissed: false,
          createdAt: dayjs().subtract(18, "day").toDate(),
          title: "Demo Notice | Warning",
          content: `
# This is a demo notice (mdx) with large amounts of text.

Warning: This notice is **important**. Please read it.
`,
        },
      ] as const)
    // fetch(`${API_BASE}/notice`, {
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.getNotices>)
  ),
};

export const Notifications = {
  all: z.function(z.tuple([z.string()])).implement(
    async (token) =>
      Promise.resolve([
        {
          id: "1",
          createdAt: new Date(),
          type: "info",
          title: "Demo Notification",
          content: "This is a demo notification, in the future this will be a list of notifications.",
          dismissedAt: dayjs().subtract(3, "day").toDate(),
        },
        {
          id: "2",
          createdAt: new Date(),
          type: "warning",
          title: "Demo Notification | Warning",
          content: "This is a warning demo notification, in the future this will be a list of notifications.",
          dismissedAt: null,
        },
      ] as Array<{
        id: string;
        createdAt: Date;
        type: "info" | "warning" | "error";
        title: string;
        content: string;
        dismissedAt: Date | null;
      }>)
    // fetch(`${API_BASE}/notification/all`, {
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof User.notifications>)
  ),
};
