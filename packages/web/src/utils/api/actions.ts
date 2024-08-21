import { lucia } from "@/lib/auth";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { action, redirect, reload } from "@solidjs/router";
import { appendHeader } from "vinxi/http";
import { getContext } from "../../lib/auth/context";

export const logout = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await lucia.invalidateSession(ctx.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  event.context.session = null;

  throw reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeAllSessions = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await lucia.invalidateUserSessions(ctx.user.id);
  reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeSession = action(async (session_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  await lucia.invalidateSession(session_id);

  return true;
});
