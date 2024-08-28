import { cache, redirect } from "@solidjs/router";
import { Orders } from "@taxikassede/core/src/entities/orders";
import { Rides } from "@taxikassede/core/src/entities/rides";
import { Users } from "@taxikassede/core/src/entities/users";
import { getContext } from "../auth/context";

export const getStatistics = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const rides = await Rides.countByUserId(ctx.user.id);
  const earnings = await Rides.sumByUserId(ctx.user.id, "income");
  const orders = await Orders.sumByUserId(ctx.user.id);

  let performance = orders > 0 ? Math.round((rides / orders) * 100) : 0;
  if (Number.isNaN(performance)) performance = 0;

  let preffered_currency = await Users.getPreferredCurrencyByUserId(ctx.user.id);
  if (!preffered_currency) preffered_currency = { prefix: "$", sufix: "" };

  return {
    rides: {
      value: rides,
      prefix: "",
      sufix: "",
    },
    earnings: {
      value: earnings,
      ...preffered_currency,
    },
    orders: {
      value: orders,
      prefix: "",
      sufix: "",
    },
    performance: {
      value: performance,
      prefix: "",
      sufix: "%",
    },
  };
}, "statistics");
