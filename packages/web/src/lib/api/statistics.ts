import { query, redirect } from "@solidjs/router";
import { Calendar } from "@taxikassede/core/src/entities/calendar";
import { Orders } from "@taxikassede/core/src/entities/orders";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { getCookie, getHeader } from "vinxi/http";
import { ensureAuthenticated } from "../auth/context";

export type StatisticsResponse =
  | {
      type: "simple";
      days_worked: number;
      tours: number;
      occupied_distance: number;
      total_distance: number;
      total_revenue: string;
    }
  | {
      type: "advanced";
      rides: { value: number; prefix: string; sufix: string; priority: number; description: string };
      earnings: { value: number; prefix: string; sufix: string; priority: number; description: string };
      orders: { value: number; prefix: string; sufix: string; priority: number; description: string };
      performance: { value: number; prefix: string; sufix: string; priority: number; description: string };
    };
export type StatisticsSimple = Extract<StatisticsResponse, { type: "simple" }>;
export const getStatistics = query(async (options: { type: "simple" | "advanced" }) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  if (!ctx.session.company_id) {
    throw redirect("/dashboard/companies/add");
  }
  let preffered_currency = await Users.getPreferredCurrencyByUserId(ctx.user.id);
  if (!preffered_currency) preffered_currency = { prefix: "$", sufix: "", code: "USD" };
  if (options.type === "simple") {
    const total_revenue = await Calendar.getTotalRevenueByUserId(ctx.user.id, ctx.session.company_id);
    const total_earnings = `${preffered_currency.prefix}${total_revenue.toFixed(2)} ${preffered_currency.sufix}`;
    return {
      type: "simple",
      days_worked: await Calendar.getDaysWorkedByUserId(ctx.user.id, ctx.session.company_id),
      tours: await Calendar.getToursByUserId(ctx.user.id, ctx.session.company_id),
      occupied_distance: await Calendar.getOccupiedDistanceByUserId(ctx.user.id, ctx.session.company_id),
      total_distance: await Calendar.getTotalDistanceByUserId(ctx.user.id, ctx.session.company_id),
      total_revenue: total_earnings,
    } satisfies StatisticsResponse;
  }
  const rides = await Rides.countByUserId(ctx.user.id);
  const total_earnings = await Rides.sumByUserId(ctx.user.id, "income");
  const earningsThisMonth = await Rides.sumByUserIdForThisMonth(ctx.user.id, "income");
  const orders = await Orders.sumByUserId(ctx.user.id);

  let performance = orders > 0 ? Math.round((rides / orders) * 100) : 0;
  if (Number.isNaN(performance)) performance = 0;

  return {
    type: "advanced",
    rides: {
      value: rides,
      prefix: "",
      sufix: "",
      priority: 2,
      description: "All the rides you have done",
    },
    earnings: {
      value: earningsThisMonth,
      ...preffered_currency,
      priority: 1,
      description: `You made ${preffered_currency.prefix}${total_earnings.toFixed(2)} ${preffered_currency.sufix} in total`,
    },
    orders: {
      value: orders,
      prefix: "",
      sufix: "",
      priority: 2,
      description: "All the orders you have made",
    },
    performance: {
      value: performance,
      prefix: "",
      sufix: "%",
      priority: 2,
      description: "Your performance",
    },
  } satisfies StatisticsResponse;
}, "statistics");

export const getSystemStatistics = query(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  let preffered_currency = await Users.getPreferredCurrencyByUserId(ctx.user.id);
  const rs = await Rides.allNonDeleted();
  const rides = rs.length;
  let total_earnings: string | number = await Rides.sumAllNonDeleted("income");
  let earningsThisMonth = await Rides.sumAllNonDeletedThisMonth("income");

  let language = "en";
  // check cookie
  const c = getCookie("language");
  if (c) {
    language = c;
  }
  // check request header or cookie
  const h = getHeader("accept-language");
  if (h) {
    language = h.split(",")[0];
  }
  const t_es = new Intl.NumberFormat(language, {
    style: "currency",
    currency: preffered_currency.code,
  }).formatToParts(total_earnings);
  // without the currency code
  const t_e = t_es.filter((p) => p.type !== "currency");
  total_earnings = t_e.map((p) => p.value).join("");

  const os = await Orders.allNonDeleted();
  const orders = os.length;
  const performance = 0;

  if (!preffered_currency) preffered_currency = { prefix: "$", sufix: "", code: "USD" };
  return {
    rides: {
      value: rides,
      prefix: "",
      sufix: "",
      priority: 2,
      description: "All the rides in the system",
    },
    earnings: {
      value: earningsThisMonth,
      ...preffered_currency,
      priority: 1,
      description: `The system made ${preffered_currency.prefix}${total_earnings} ${preffered_currency.sufix} in total`,
    },
    orders: {
      value: orders,
      prefix: "",
      sufix: "",
      priority: 2,
      description: "All the orders in the system",
    },
    performance: {
      value: performance,
      prefix: "",
      sufix: "%",
      priority: 2,
      description: "Overall performance",
    },
  };
}, "system-statistics");
