import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));
export const parseLocaleNumber = (locale: string, stringNumber: string) => {
  const thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, "");
  const decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, "");

  return parseFloat(
    stringNumber
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), ".")
  );
};

export const shortUsername = (name: string) => {
  const ns = name.trim().split(" ");
  let n = "";
  for (let x of ns) {
    n += x[0];
  }

  return n;
};

export const footer_links = {
  "Open Source": [
    {
      name: "GitHub",
      href: "#",
    },
    {
      name: "Issues",
      href: "#",
    },
  ],
  Community: [
    {
      name: "Blog",
      href: "#",
    },
    {
      name: "Discord",
      href: "#",
    },
    {
      name: "Twitter",
      href: "#",
    },
  ],
  Legal: [
    {
      name: "Privacy",
      href: "/privacy",
    },
    {
      name: "Terms of Service",
      href: "/terms-of-service",
    },
  ],
  Project: [
    {
      name: "Roadmap",
      href: "#",
    },
    {
      name: "Team",
      href: "#",
    },
    {
      name: "Vision",
      href: "#",
    },
    {
      name: "Brand",
      href: "#",
    },
  ],
};
