import { Auth } from "@/lib/auth";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { action, redirect, reload } from "@solidjs/router";
import { getContext } from "../../lib/auth/context";

export const logout = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await Auth.invalidateSession(ctx.session.id);
  Auth.setSessionCookie(event, "");
  event.context.session = null;

  throw reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeAllSessions = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await Auth.invalidateSessions(ctx.user.id);
  reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeSession = action(async (session_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  await Auth.invalidateSession(ctx.session.id);

  return true;
});
