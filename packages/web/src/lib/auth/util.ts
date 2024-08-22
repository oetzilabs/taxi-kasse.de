import { cache, redirect } from "@solidjs/router";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Users } from "@taxikassede/core/src/entities/users";
import { getCookie, getEvent } from "vinxi/http";
import { lucia } from ".";
import { getContext } from "./context";

export const getAuthenticatedUser = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) {
    throw redirect("/auth/login");
  }

  if (!ctx.session) {
    console.error("Unauthorized");
    throw redirect("/auth/login");
  }

  if (!ctx.user) {
    console.error("Unauthorized");
    throw redirect("/auth/login");
  }
  const { user } = await lucia.validateSession(ctx.session.id);
  return user;
}, "user");

export type UserSession = {
  id: string | null;
  token: string | null;
  expiresAt: Date | null;
  user: Awaited<ReturnType<typeof Users.findById>> | null;
  organization: Awaited<ReturnType<typeof Organizations.findById>> | null;
  organizations: Awaited<ReturnType<typeof Organizations.findByUserId>>;
  createdAt: Date | null;
};

export const getAuthenticatedSession = cache(async () => {
  "use server";
  let userSession = {
    id: null,
    token: null,
    expiresAt: null,
    user: null,
    organization: null,
    organizations: [],
    workspace: null,
    createdAt: null,
  } as UserSession;
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    // throw redirect("/auth/login");
    return userSession;
  }
  const { session } = await lucia.validateSession(sessionId);
  if (!session) {
    // throw redirect("/auth/login");
    // console.error("invalid session");
    return userSession;
  }

  userSession.id = session.id;
  if (session.organization_id) userSession.organization = await Organizations.findById(session.organization_id);
  if (session.userId) {
    userSession.user = await Users.findById(session.userId);
    userSession.organizations = await Organizations.findByUserId(session.userId);
  }
  if (session.createdAt) userSession.createdAt = session.createdAt;

  return userSession;
}, "session");

export const getAuthenticatedSessions = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) {
    throw redirect("/auth/login");
  }

  if (!ctx.session) {
    console.error("Unauthorized");
    throw redirect("/auth/login");
  }

  if (!ctx.user) {
    console.error("Unauthorized");
    throw redirect("/auth/login");
  }
  const sessions = await lucia.getUserSessions(ctx.user.id);
  return sessions;
}, "sessions");

export const getCurrentOrganization = cache(async () => {
  "use server";
  const event = getEvent()!;

  if (!event.context.session) {
    return redirect("/auth/login");
  }

  const { id } = event.context.session;

  const { user, session } = await lucia.validateSession(id);

  if (!user || !session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }

  const org = Organizations.findById(session.organization_id);

  if (!org) {
    throw redirect("/setup/organization");
  }

  return org;
}, "current-organization");
