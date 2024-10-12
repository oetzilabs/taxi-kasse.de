import { cache, redirect } from "@solidjs/router";
import { Orders } from "@taxikassede/core/src/entities/orders";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { getCookie, getHeader } from "vinxi/http";
import { getContext } from "../auth/context";
import { getLanguage } from "./application";

export const getStatistics = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const rides = await Rides.countByUserId(ctx.user.id);
  const total_earnings = await Rides.sumByUserId(ctx.user.id, "income");
  const earningsThisMonth = await Rides.sumByUserIdForThisMonth(ctx.user.id, "income");
  const orders = await Orders.sumByUserId(ctx.user.id);

  let performance = orders > 0 ? Math.round((rides / orders) * 100) : 0;
  if (Number.isNaN(performance)) performance = 0;

  let preffered_currency = await Users.getPreferredCurrencyByUserId(ctx.user.id);
  if (!preffered_currency) preffered_currency = { prefix: "$", sufix: "", code: "USD" };

  return {
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
      description: `You made ${preffered_currency.prefix}${total_earnings} ${preffered_currency.sufix} in total`,
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
  };
}, "statistics");

export const getSystemStatistics = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  let preffered_currency = await Users.getPreferredCurrencyByUserId(ctx.user.id);
  const rs = await Rides.allNonDeleted();
  const rides = rs.length;
  let total_earnings: string | number = 0;
  let earningsThisMonth = 0;
  for (const r of rs) {
    const earnings = Number(r.income);
    if (Number.isNaN(earnings)) continue;
    total_earnings += earnings;
    if (r.startedAt.getMonth() === new Date().getMonth()) {
      earningsThisMonth += earnings;
    }
  }
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
