import { APIEvent, redirect, serializeCookie } from "solid-start";

export const GET = async (event: APIEvent) => {
  const url = new URL(event.request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    throw new Error("Code missing");
  }
  const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "google",
      code,
      redirect_uri: `${url.origin}${url.pathname}`,
    }),
  }).then((r) => r.json());
  const c = serializeCookie("session", response.access_token, {
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect("/", {
    // redirect to the frontend
    status: 302,
    headers: {
      Authorization: `Bearer ${response.access_token}`,
      "Set-Cookie": c,
    },
  });
};
