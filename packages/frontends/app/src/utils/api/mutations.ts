import { Company } from "@taxi-kassede/core/entities/company";
import { User } from "@taxi-kassede/core/entities/users";
import { z } from "zod";
import { UserCreateReportResult } from "../../../../../functions/src/user";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;

export const createCompanyZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      name: z.string(),
      email: z.string().email(),
      phonenumber: z.string().optional(),
    }),
  ])
);

export const createCompany = createCompanyZod.implement(async (token, input) =>
  fetch(`${API_BASE}/company/create`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  }).then((x) => x.json() as ReturnType<typeof Company.create>)
);

export const createDayEntryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      date: z.date(),
      total_distance: z.number(),
      driven_distance: z.number(),
      tour_count: z.number(),
      cash: z.number(),
    }),
  ])
);

export const createDayEntry = createDayEntryZod.implement(async (token, input) =>
  fetch(`${API_BASE}/user/day_entry/create`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  }).then((x) => x.json() as ReturnType<typeof User.createDayEntry>)
);

export const updateDayEntryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      id: z.string(),
      total_distance: z.number(),
      driven_distance: z.number(),
      tour_count: z.number(),
      cash: z.number(),
    }),
  ])
);

export const updateDayEntry = updateDayEntryZod.implement(async (token, input) =>
  fetch(`${API_BASE}/user/day_entry/update`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  }).then((x) => x.json() as ReturnType<typeof User.updateDayEntry>)
);

export const deleteDayEntryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      id: z.string(),
    }),
  ])
);

export const deleteDayEntry = deleteDayEntryZod.implement(async (token, input) =>
  fetch(`${API_BASE}/user/day_entry/${input.id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((x) => x.json() as ReturnType<typeof User.deleteDayEntry>)
);

export const createReportZod = z.function(
  z.tuple([
    z.string(),
    z
      .object({
        from: z.date(),
        to: z.date(),
      })
      .or(z.enum(["month", "year", "all"])),
  ])
);

export const createReport = createReportZod.implement(async (token, input) =>
  fetch(`${API_BASE}/user/report/create`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date_range: input }),
  }).then((x) => x.json() as Promise<UserCreateReportResult>)
);

export const downloadReportZod = z.function(z.tuple([z.string(), z.string()]));

export const downloadReport = downloadReportZod.implement(async (token, key) =>
  fetch(`${API_BASE}/user/report/sign`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  })
    .then((x) => x.text())
    .then((x) => fetch(x))
    .then((x) => x.blob())
    .then((x) => new File([x], "report.pdf", { type: "application/pdf" }))
);

export const Notices = {
  dismiss: z.function(z.tuple([z.string(), z.string().uuid()])).implement(
    async (token, id) =>
      Promise.resolve({
        id,
        title: "Notice",
        content: "This is a notice",
        createdAt: new Date(),
        dismissed: true,
      })
    // fetch(`${API_BASE}/notice/${id}`, {
    //   method: "PUT",
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.dismiss>)
  ),
  dismissAll: z.function(z.tuple([z.string()])).implement(
    async (token) =>
      Promise.resolve([
        {
          id: "1",
          title: "Notice",
          content: "This is a notice",
          createdAt: new Date(),
          dismissed: true,
        },
      ])
    // fetch(`${API_BASE}/notice/all`, {
    //   method: "PUT",
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.dismissAll>)
  ),
};

export const Notifications = {
  dismiss: z.function(z.tuple([z.string(), z.string().uuid()])).implement(
    async (token, id) =>
      Promise.resolve({
        id,
        title: "Notification",
        content: "This is a notification",
        createdAt: new Date(),
        dismissed: true,
      })
    // fetch(`${API_BASE}/notification/${id}`, {
    //   method: "PUT",
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.dismiss>)
  ),
  dismissAll: z.function(z.tuple([z.string()])).implement(
    async (token) =>
      Promise.resolve([
        {
          id: "1",
          title: "Notification",
          content: "This is a notification",
          createdAt: new Date(),
          dismissed: true,
        },
      ])
    // fetch(`${API_BASE}/notification/all`, {
    //   method: "PUT",
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }).then((res) => res.json() as ReturnType<typeof System.dismissAll>)
  ),
};
