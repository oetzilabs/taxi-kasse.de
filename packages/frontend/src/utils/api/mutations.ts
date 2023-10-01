import { Company } from "@taxi-kassede/core/entities/company";
import { User } from "@taxi-kassede/core/entities/users";
import { z } from "zod";

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
