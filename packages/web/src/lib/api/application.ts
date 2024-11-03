import { action, query, redirect } from "@solidjs/router";
import { currency_code } from "@taxikassede/core/src/drizzle/sql/schema";
import { Users } from "@taxikassede/core/src/entities/users";
import { getCookie, getHeader } from "vinxi/http";
import { getContext } from "../auth/context";

export const getLanguage = query(async () => {
  "use server";
  let language = "en";
  const [ctx, event] = await getContext();
  if (!ctx) return language;
  if (!ctx.session) return language;
  if (!ctx.user) return language;
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
  return language;
}, "language");

export const getCurrencies = query(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) return [];
  if (!ctx.session) return [];
  if (!ctx.user) return [];
  const convert_currency_to_symbol: Record<
    (typeof currency_code.enumValues)[number],
    {
      prefix: string;
      sufix: string;
    }
  > = {
    EUR: { prefix: "", sufix: "€" },
    GBP: { prefix: "", sufix: "£" },
    CHF: { prefix: "", sufix: "" },

    JPY: { prefix: "¥", sufix: "JPY" },

    USD: { prefix: "$", sufix: "USD" },
    AUD: { prefix: "$", sufix: "AUD" },
    CAD: { prefix: "$", sufix: "CAD" },
    NZD: { prefix: "$", sufix: "NZD" },
  };
  const currencies = [];
  const keys = Object.keys(convert_currency_to_symbol) as (typeof currency_code.enumValues)[number][];
  for (const key of keys) {
    currencies.push({
      label: [
        convert_currency_to_symbol[key]!.prefix.length === 0 ? key : convert_currency_to_symbol[key]!.prefix,
        convert_currency_to_symbol[key]!.sufix,
      ].join(" "),
      value: key,
    });
  }
  return currencies;
}, "currencies");

export type CurrencyCode = (typeof currency_code.enumValues)[number];

export const setPreferedCurrency = action(async (currency_code: CurrencyCode) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  if (!ctx.session)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  if (!ctx.user)
    throw redirect("/auth/login", {
      statusText: "Please login",
      status: 401,
    });
  // console.log("setPreferedCurrency", currency_code, ctx.user.id);
  const user = await Users.update({
    id: ctx.user.id,
    currency_code: currency_code,
  });
  return true;
});
