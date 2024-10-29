import type { Validator } from "@taxikassede/core/src/validator";
import type { InferInput } from "valibot";
import { action, cache, redirect } from "@solidjs/router";
import { Companies } from "@taxikassede/core/src/entities/companies";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { appendHeader } from "vinxi/http";
import { lucia } from "../auth";
import { ensureAuthenticated } from "../auth/context";
import { getAuthenticatedSession } from "../auth/util";

export const createCompany = action(async (data: InferInput<typeof Companies.CreateWithoutOwnerAndCharges>) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const d = Object.assign(data, { ownerId: ctx.user.id });

  const comp = await Companies.create(d);

  const oldSession = ctx.session;

  // invalidate session
  await lucia.invalidateSession(oldSession.id);

  const session = await lucia.createSession(
    ctx.user.id,
    {
      ...oldSession,
      createdAt: new Date(),
      company_id: comp.id,
    },
    {
      sessionId: oldSession.id,
    },
  );

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  throw redirect("/dashboard/companies", {
    revalidate: [getAuthenticatedSession.key],
  });
});

export const joinCompany = action(async (name: string) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const org = await Companies.findByName(name);

  if (!org) {
    throw new Error("Company not found");
  }

  // request to join the organization

  return true;
});

export const removeCompany = action(async (id: InferInput<typeof Validator.Cuid2Schema>) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const comp = await Companies.findById(id);

  if (!comp) {
    throw new Error("Company not found");
  }

  if (comp.owner?.id !== ctx.user.id) {
    throw new Error("You are not the owner of this company");
  }

  const removed = await Companies.remove(id);

  if (!removed) {
    throw new Error("Failed to remove company");
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
      company_id: null,
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

export const getCompanyById = cache(async (id: InferInput<typeof Validator.Cuid2Schema>) => {
  "use server";
  if (!id) return undefined;
  const [ctx, event] = await ensureAuthenticated();

  const comp = await Companies.findById(id);

  if (!comp) {
    throw redirect("/404", { status: 404 });
  }
  return comp;
}, "company");

export const updateCompany = action(async (data: InferInput<typeof Companies.UpdateSchema>) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const comp = await Companies.findById(data.id);

  if (!comp) {
    throw new Error("Company not found");
  }

  if (comp.owner?.id !== ctx.user.id) {
    throw new Error("You are not the owner of this company");
  }

  const updated = await Companies.update(data);

  if (!updated) {
    throw new Error("Failed to update company");
  }

  return updated;
});

export const resetCompanyChargesToOrganization = action(async (c_id, org_id) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  const comp = await Companies.findById(c_id);

  if (!comp) {
    throw new Error("Company not found");
  }

  if (comp.owner?.id !== ctx.user.id) {
    throw new Error("You are not the owner of this company");
  }

  const org = await Organizations.findById(org_id);

  if (!org) {
    throw new Error("Organization not found");
  }
  const updated = await Companies.update({
    ...comp,
    base_charge: Number(org.base_charge),
    distance_charge: Number(org.distance_charge),
    time_charge: Number(org.time_charge),
  });

  if (!updated) {
    throw new Error("Failed to update company");
  }

  return updated;
});
