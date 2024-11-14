import type { Validator } from "@taxikassede/core/src/validator";
import type { InferInput } from "valibot";
import { action, redirect } from "@solidjs/router";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Auth } from "../auth";
import { ensureAuthenticated } from "../auth/context";
import { getAuthenticatedSession } from "../auth/util";

export const createOrganization = action(async (name: string, phoneNumber: string, email: string) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const org = await Organizations.create({ name, phoneNumber, email, ownerId: ctx.user.id });

  const oldSession = ctx.session;

  // invalidate session
  await Auth.invalidateSession(oldSession.id);

  const sessionToken = Auth.generateSessionToken();

  const session = await Auth.createSession(sessionToken, {
    ...oldSession,
    organization_id: org.id,
  });

  Auth.setSessionCookie(event, sessionToken);
  event.context.session = session;

  throw redirect("/dashboard/organizations", {
    revalidate: [getAuthenticatedSession.key],
  });
});

export const joinOrganization = action(async (name: string) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const org = await Organizations.findByName(name);

  if (!org) {
    throw new Error("Organization not found");
  }

  // request to join the organization

  return true;
});

export const removeOrganization = action(async (id: InferInput<typeof Validator.Cuid2Schema>) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

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

  const oldSession = ctx.session;

  // invalidate session
  await Auth.invalidateSession(oldSession.id);

  const sessionToken = Auth.generateSessionToken();

  const session = await Auth.createSession(sessionToken, {
    ...oldSession,
    organization_id: null,
  });

  Auth.setSessionCookie(event, sessionToken);
  event.context.session = session;

  throw redirect("/dashboard", {
    revalidate: [getAuthenticatedSession.key],
  });
});

export const getOrganizationById = async (id: InferInput<typeof Validator.Cuid2Schema>) => {
  "use server";
  if (!id) return undefined;
  const [ctx, event] = await ensureAuthenticated();

  const org = await Organizations.findById(id);

  if (!org) {
    throw redirect("/404", { status: 404 });
  }
  return org;
};

export const updateOrganization = action(async (data: InferInput<typeof Organizations.UpdateSchema>) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const org = await Organizations.findById(data.id);

  if (!org) {
    throw new Error("Organization not found");
  }

  if (org.owner?.id !== ctx.user.id) {
    throw new Error("You are not the owner of this organization");
  }

  const updated = await Organizations.update(data);

  if (!updated) {
    throw new Error("Failed to update organization");
  }

  return updated;
});
