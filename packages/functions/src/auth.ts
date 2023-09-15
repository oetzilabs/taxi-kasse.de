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
  sessions,
  clients: async () => ({
    google: "http://localhost:3000/",
  }),
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      mode: "oidc",
    }),
  },
  onError: async (error) => {
    return { body: JSON.stringify(error), statusCode: 500, headers: {} };
  },
  async onAuthorize(event) {
    // any code you want to run when auth begins
    console.log({ onAuthorize: event });
  },
  onSuccess: async ({ tokenset, provider }, response) => {
    const claims = tokenset.claims();

    if (!claims.sub) throw new Error("No sub claim in token");
    if (!claims.name) throw new Error("No name claim in token");
    if (!claims.email) throw new Error("No email claim in token");
    if (!claims.picture) throw new Error("No picture claim in token");
    const [userExists] = await User.findByEmail(claims.email);

    if (provider === "google") {
      if (!userExists) {
        let [cu] = await User.create([
          {
            name: claims.name,
            email: claims.email,
          },
        ]);
        return response.session({
          //@ts-ignore
          type: "user",
          user: {
            name: claims.name,
            email: claims.email,
            sub: claims.sub,
            image: claims.picture,
            id: cu.id,
          },
        });
      } else {
        return response.session({
          //@ts-ignore
          type: "user",
          user: {
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
});
