import clsx, { type ClassValue } from "clsx";
import { createSignal } from "solid-js";
import { twMerge } from "tailwind-merge";

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

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
