import type { APIEvent } from "@solidjs/start/server";
import { Auth } from "@/lib/auth";
import { GoogleClient } from "@/lib/auth/client";
import { subjects } from "@taxikassede/core/src/auth/subjects";
import { Companies } from "@taxikassede/core/src/entities/companies";
import { Organizations } from "@taxikassede/core/src/entities/organizations";
import { Users } from "@taxikassede/core/src/entities/users";
import { getRequestFingerprint, getRequestIP, sendRedirect } from "vinxi/http";

export async function GET(e: APIEvent) {
  const event = e.nativeEvent;
  const url = new URL(e.request.url);
  const code = url.searchParams.get("code");
  if (!code) throw new Error("Missing code");

  const verified_tokens = await GoogleClient.exchange(code, import.meta.env.VITE_LOGIN_REDIRECT_URI);

  if (verified_tokens.err) {
    return sendRedirect(event, "/auth/error?error=exchange_failed&message=" + verified_tokens.err.message, 303);
  }

  const verified_tokens_subjects = await GoogleClient.verify(subjects, verified_tokens.tokens.access, {
    refresh: verified_tokens.tokens.refresh,
  });

  if (verified_tokens_subjects.err) {
    return sendRedirect(event, "/auth/error?error=invalid_tokens&message=" + verified_tokens_subjects.err.message);
  }

  const sessionToken = Auth.generateSessionToken();

  if (verified_tokens_subjects.subject.type !== "user") {
    return sendRedirect(event, "/auth/error?error=invalid_subject", 303);
  }

  const user = await Users.findById(verified_tokens_subjects.subject.properties.id);
  if (!user) return sendRedirect(event, "/auth/error?error=missing_user", 303);

  const last_created_company = await Companies.lastCreatedByUserId(user.id);
  const last_created_organization = await Organizations.lastCreatedByUserId(user.id);

  const ip = getRequestIP(event);
  const ip2 = getRequestIP(event, { xForwardedFor: true });
  const finalIp = ip2 ?? ip;
  const fingerprint = await getRequestFingerprint(event);

  const session = await Auth.createSession(sessionToken, {
    userId: user.id,
    cookie_token: sessionToken,
    access_token: verified_tokens.tokens.access,
    refresh_token: verified_tokens.tokens.refresh,
    company_id: last_created_company?.id,
    organization_id: last_created_organization?.id,
    browser: e.request.headers.get("user-agent") ?? "unknown",
    ip: finalIp ?? "unknown",
    fingerprint,
  });

  Auth.setSessionCookie(event, sessionToken);

  event.context.session = session;

  return sendRedirect(event, "/dashboard", 303);
}
