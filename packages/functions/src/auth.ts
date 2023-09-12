import { User } from "@taxi-kassede/core/entities/users";
import { AuthHandler, GoogleAdapter, createSessionBuilder } from "sst/node/future/auth";

import { Config } from "sst/node/config";
import { useDomainName } from "sst/node/api";
// define session types
export const sessions = createSessionBuilder<{
  user: {
    id: string;
  };
}>();

export const handler = AuthHandler({
  sessions,
  clients: async () => {
    const cb = useDomainName();
    return {
      google: `https://${cb}/callback`,
    };
  },
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      mode: "oidc",
    }),
  },
  async onAuthorize() {
    // any code you want to run when auth begins
  },
  onSuccess: async (input, response) => {
    console.log(input.tokenset);
    const claims = input.tokenset.claims();

    if (!claims.sub) throw new Error("No sub claim in token");
    if (!claims.name) throw new Error("No name claim in token");
    if (!claims.email) throw new Error("No email claim in token");
    const userExists = await User.findByEmail(claims.email);

    let user: Awaited<ReturnType<typeof User.create>>[number] | null = null;

    if (!userExists) {
      let [cu] = await User.create([
        {
          name: claims.name,
          email: claims.email,
        },
      ]);
      user = cu;
    }
    if (!user) {
      throw new Error("User not found/created");
    }
    return response.session({
      type: "user",
      properties: {
        id: user.id,
      },
    });
  }, // This callback needs some work, not spec compliant currently
  async onError() {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "Auth failed",
    };
  },
});
