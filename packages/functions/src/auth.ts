import { User } from "@taxi-kassede/core/entities/users";
import { Config } from "sst/node/config";
import { AuthHandler, GoogleAdapter, createSessionBuilder } from "sst/node/future/auth";

export const sessions = createSessionBuilder<{
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    sub: string;
  };
}>();

export type UserSession = ReturnType<typeof sessions.use>;
export type UserSessionAuthenticated = Extract<UserSession, { type: "user" }>;

export const handler = AuthHandler({
  callbacks: {
    auth: {
      async allowClient(clientID, redirect) {
        if (clientID === "google") return true;
        return false;
      },
      async success(input, response) {
        const claims = input.tokenset.claims();

        if (!claims.sub) throw new Error("No sub claim in token");
        if (!claims.name) throw new Error("No name claim in token");
        if (!claims.email) throw new Error("No email claim in token");
        if (!claims.picture) throw new Error("No picture claim in token");
        const [userExists] = await User.findByEmail(claims.email);

        if (input.provider === "google") {
          if (!userExists) {
            let cu = await User.create(
              {
                name: claims.name,
                email: claims.email,
              },
              {
                birthdate: claims.birthdate,
                image: claims.picture,
                locale: claims.locale,
                preferredUsername: claims.preferred_username,
                phoneNumber: claims.phone_number,
              }
            );
            return response.session({
              type: "user",
              properties: {
                name: claims.name,
                email: claims.email,
                sub: claims.sub,
                image: claims.picture,
                id: cu.id,
              },
            });
          } else {
            return response.session({
              type: "user",
              properties: {
                sub: claims.sub,
                id: userExists.id,
                name: userExists.name,
                email: userExists.email,
                image: claims.picture,
              },
            });
          }
        }

        throw new Error("Unknown provider");
      },
    },
  },
  sessions,
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      mode: "oidc",
    }),
  },
  onError: async (error) => {
    return { body: JSON.stringify(error), statusCode: 500, headers: {} };
  },
});
