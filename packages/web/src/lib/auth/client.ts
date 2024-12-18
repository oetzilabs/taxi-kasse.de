import { createClient } from "@openauthjs/openauth/client";
import { Resource } from "sst";
import { H3Event, setCookie } from "vinxi/http";

export { subjects } from "@taxikassede/core/src/auth/subjects";

export const GoogleClient = createClient({
  clientID: "google",
  issuer: Resource.Auth.url,
});

export function setTokens(event: H3Event, access: string, refresh: string) {
  setCookie(event, "refresh_token", refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 34560000,
  });
  setCookie(event, "access_token", access, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 34560000,
  });
}
