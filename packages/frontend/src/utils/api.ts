import dayjs from "dayjs";
import { z } from "zod";
import { User } from "@taxi-kassede/core/entities/users";
import { Company } from "../../../core/src/entities/company";
import { createMutation, createQuery } from "@tanstack/solid-query";

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

export const company = z.function(z.tuple([z.string()])).implement(async (token) => {
  const x = await fetch(`${API_BASE}/user/company`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return x.json() as Promise<
    | { error: null; company: NonNullable<Awaited<ReturnType<typeof User.findById>>>["company"] }
    | {
        error: string;
        company: null;
      }
  >;
});

export const companyQueryZod = z.function(z.tuple([z.string()]));

export const companyQuery = companyQueryZod.implement(async (token) =>
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

export const calendar = z
  .function(
    z.tuple([
      z.string(),
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    ])
  )
  .implement(async (token, range) => {
    const x = await fetch(
      `${API_BASE}/user/calendar?from=${encodeURIComponent(dayjs(range.from).toISOString())}&to=${encodeURIComponent(
        dayjs(range.to).toISOString()
      )}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    return x.json() as Promise<
      | { error: null; calendar: NonNullable<Awaited<ReturnType<typeof User.findById>>>["day_entries"] }
      | {
          error: string;
          calendar: null;
        }
    >;
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

export const calendarQueryZod = z.function(
  z.tuple([
    z.string(),
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  ])
);
export const calendarQuery = calendarQueryZod.implement(async (token, range) =>
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
    .then(
      (res) =>
        res.json() as Promise<
          | { error: null; calendar: NonNullable<Awaited<ReturnType<typeof User.findById>>>["day_entries"] }
          | {
              error: string;
              calendar: null;
            }
        >
    )
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

export const statisticsQuery = statisticsQueryZod.implement(async (token, range) =>
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
