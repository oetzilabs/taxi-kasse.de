import dayjs from "dayjs";
import { z } from "zod";
import { User } from "@taxi-kassede/core/entities/users";
import { Company } from "../../../core/src/entities/company";

export * as API from "./api";

const API_BASE = import.meta.env.VITE_API_URL;

export const statistics = z
  .function(
    z.tuple([
      z.string(),
      z.object({
        from: z.date(),
        to: z.date().default(new Date()),
      }),
    ])
  )
  .implement(async (token, range) => {
    const x = await fetch(
      `${API_BASE}/user/statistics?from=${encodeURIComponent(dayjs(range.from).toISOString())}&to=${encodeURIComponent(
        dayjs(range.to).toISOString()
      )}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    return x.json() as ReturnType<typeof User.statistics>;
  });

export const data = z.function(z.tuple([z.string()])).implement(async (token) => {
  const x = await fetch(`${API_BASE}/data`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return x.json() as Promise<{ error: string } | { company: any }>;
});

export const hasCompany = z.function(z.tuple([z.string()])).implement(async (token) => {
  const x = await fetch(`${API_BASE}/user/hasCompany`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return x.json() as Promise<
    | { success: false; error: string; hasCompany: false }
    | {
        success: true;
        hasCompany: boolean;
      }
  >;
});

export const searchCompany = z.function(z.tuple([z.string()])).implement(async (query) => {
  const x = await fetch(`${API_BASE}/company/search?query=${encodeURIComponent(query)}`);
  return x.json() as Promise<
    | { success: false; error: string; companies: Awaited<ReturnType<typeof Company.search>> }
    | {
        success: true;
        companies: Awaited<ReturnType<typeof Company.search>>;
      }
  >;
});

export const createCompany = z
  .function(
    z.tuple([
      z.string(),
      z.object({
        name: z.string(),
        email: z.string().email(),
        phonenumber: z.string().optional(),
      }),
    ])
  )
  .implement(async (token, input) => {
    const x = await fetch(`${API_BASE}/company/create`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return x.json() as ReturnType<typeof Company.create>;
  });

export const createDayEntry = z
  .function(
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
  )
  .implement(async (token, input) => {
    const x = await fetch(`${API_BASE}/user/day_entry/create`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return x.json() as ReturnType<typeof User.createDayEntry>;
  });

export const updateDayEntry = z
  .function(
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
  )
  .implement(async (token, input) => {
    const x = await fetch(`${API_BASE}/user/day_entry/update`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return x.json() as ReturnType<typeof User.updateDayEntry>;
  });
