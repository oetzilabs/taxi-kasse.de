import { redirect } from "@solidjs/router";
import { getCookie, getEvent } from "vinxi/http";
import { Auth } from ".";

export const getContext = async () => {
  const event = getEvent()!;
  const sessionToken = getCookie(event, Auth.SESSION_COOKIE_NAME) ?? null;
  if (!sessionToken) {
    return [null, event] as const;
  }

  const authContext = await Auth.validateSessionToken(sessionToken);
  if (!authContext) {
    return [null, event] as const;
  }
  return [authContext, event] as const;
};

export const ensureAuthenticated = async () => {
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  return [ctx, event] as const;
};
