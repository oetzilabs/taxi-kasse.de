import { redirect } from "@solidjs/router";
import { getCookie, getEvent } from "vinxi/http";
import { lucia } from ".";

export const getContext = async () => {
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return [null, event] as const;
  }
  const luciaContext = await lucia.validateSession(sessionId);
  if (!luciaContext) {
    return [null, event] as const;
  }
  return [luciaContext!, event] as const;
};

export const ensureAuthenticated = async () => {
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  return [ctx, event] as const;
};
