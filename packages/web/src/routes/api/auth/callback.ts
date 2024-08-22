import { lucia } from "@/lib/auth";
import type { APIEvent } from "@solidjs/start/server";
import { appendHeader, sendRedirect } from "vinxi/http";

export async function GET(e: APIEvent) {
  const event = e.nativeEvent;
  const url = new URL(e.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return sendRedirect(event, "/auth/error?error=missing_code", 303);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "google",
    code,
    redirect_uri: `${url.origin}${url.pathname}`,
  });

  const response = await fetch(`${import.meta.env.VITE_AUTH_URL}token`, {
    method: "POST",
    body,
  }).then(async (r) => r.json());

  if (!response.access_token) {
    return sendRedirect(event, "/auth/error?error=missing_access_token", 303);
  }

  const sessionResponse = await fetch(new URL("/session", import.meta.env.VITE_API_URL), {
    headers: {
      Authorization: `Bearer ${response.access_token}`,
    },
  }).then((r) => r.json());

  const { id, organization_id } = sessionResponse;

  if (!id) {
    return sendRedirect(event, "/auth/error?error=missing_user", 303);
  }

  const session = await lucia.createSession(id, {
    access_token: response.access_token,
    organization_id: organization_id ?? null,
    createdAt: new Date(),
  });

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  event.context.session = session;
  event.context.user = null;

  return sendRedirect(event, "/", 303);
}
