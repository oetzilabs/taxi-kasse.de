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
          title: "Demo Notice",
          content: `
# This is a demo notice (mdx) with large amounts of text. 

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Massa tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin. Pretium viverra suspendisse potenti nullam ac tortor vitae purus faucibus. Aliquet enim tortor at auctor. Enim nec dui nunc mattis. Interdum posuere lorem ipsum dolor. Tristique senectus et netus et malesuada fames ac turpis egestas. 

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
