import { User } from "@taxi-kassede/core/entities/users";
import { useDomainName } from "sst/node/api";
import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";

import { Config } from "sst/node/config";

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      mode: "oidc",
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims();

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
        return Session.cookie({
          type: "public",
          redirect: useDomainName(),
          properties: {
            id: user.id,
          },
        });
      }, // This callback needs some work, not spec compliant currently
    }),
  },
});
