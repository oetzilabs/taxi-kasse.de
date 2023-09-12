import { Auth } from "sst/node/future/auth";
import { APIEvent, createCookie } from "solid-start";

export async function GET(event: APIEvent) {
  const u = new URL(event.request.url);
  const searchParams = new URLSearchParams(event.request.url);
  const code = searchParams.get("code");
  if (!code) {
    throw new Error("Code missing");
  }
  const response = await fetch(Auth.auth.url + "/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "local",
      code,
      redirect_uri: `${u.origin}${u.pathname}`,
    }),
  }).then((r) => r.json());
  const cookie = createCookie("sst_auth_token", {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  await cookie.serialize(response.access_token);
  return {
    status: 303,
    headers: {
      location: "/",
      "set-cookie": cookie.toString(),
    },
  };
}
