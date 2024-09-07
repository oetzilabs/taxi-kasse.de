import type { Validator } from "@taxikassede/core/src/validator";
import type { InferInput } from "valibot";
import { action, redirect } from "@solidjs/router";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { appendHeader } from "vinxi/http";
import { lucia } from "../auth";
import { getContext } from "../auth/context";
import { getAuthenticatedSession } from "../auth/util";

export const createOrganization = action(async (name: string, phoneNumber: string, email: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const org = await Organizations.create({ name, phoneNumber, email, ownerId: ctx.user.id });

  // set lucia cookie session

  const oldSession = ctx.session;

  // invalidate session
  await lucia.invalidateSession(oldSession.id);

  const session = await lucia.createSession(
    ctx.user.id,
    {
      ...oldSession,
      createdAt: new Date(),
      organization_id: org.id,
    },
    {
      sessionId: oldSession.id,
    },
  );

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  throw redirect("/dashboard/organizations", {
    revalidate: [getAuthenticatedSession.key],
  });
});

export const joinOrganization = action(async (name: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const org = await Organizations.findByName(name);

  if (!org) {
    throw new Error("Organization not found");
  }

  // request to join the organization

  return true;
});

export const removeOrganization = action(async (id: InferInput<typeof Validator.Cuid2Schema>) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const org = await Organizations.findById(id);

  if (!org) {
    throw new Error("Organization not found");
  }

  if (org.owner?.id !== ctx.user.id) {
    throw new Error("You are not the owner of this organization");
  }

  const removed = await Organizations.remove(id);

  if (!removed) {
    throw new Error("Failed to remove organization");
  }
  // set lucia cookie session

  const oldSession = ctx.session;

  // invalidate session
  await lucia.invalidateSession(oldSession.id);

  const session = await lucia.createSession(
    ctx.user.id,
    {
      ...oldSession,
      createdAt: new Date(),
      organization_id: null,
    },
    {
      sessionId: oldSession.id,
    },
  );

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  throw redirect("/dashboard", {
    revalidate: [getAuthenticatedSession.key],
  });
});
