import { cache, redirect } from "@solidjs/router";
import { getContext } from "../auth/context";

export const getEvents = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  return [] as Array<{
    id: string;
    title: string;
    description: string;
  }>;
}, "events");
