import { authorizer } from "@openauthjs/openauth";
import { GoogleOidcAdapter } from "@openauthjs/openauth/adapter/google";
import { subjects } from "@taxikassede/core/src/auth/subjects";
import { Users } from "@taxikassede/core/src/entities/users";
import { handle } from "hono/aws-lambda";
import { StatusCodes } from "http-status-codes";
import { Resource } from "sst";

export const handler = handle(
  authorizer({
    subjects,
    providers: {
      google: GoogleOidcAdapter({
        clientID: Resource.GoogleClientId.value,
        scopes: ["openid", "email", "profile"],
      }),
    },
    async success(ctx, input, req) {
      if (input.provider === "google") {
        // These claims are always available, because of the JWTPayload from Google.
        const claims = input.id as {
          email: string | undefined;
          preferred_username: string | undefined;
          name: string | undefined;
          picture: string | undefined;
        };
        const email = claims.email;
        const name = claims.preferred_username ?? claims.name;
        const image = claims.picture ?? "/assets/images/avatar.png";
        if (!email || !name) {
          console.error("No email or name found in tokenset", input);
          return new Response("No email or name found", {
            status: StatusCodes.BAD_REQUEST,
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }

        let user_ = await Users.findByEmail(email);

        if (!user_) {
          user_ = await Users.create({ email, name, image, verifiedAt: new Date() })!;
        }

        return ctx.subject("user", {
          id: user_!.id,
          email: user_!.email,
        });
      }
      throw new Error("Unknown provider");
    },
  }),
);
