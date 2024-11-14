import type { SessionSelect, UserSelect } from "@taxikassede/core/src/drizzle/sql/schema";
import { createMiddleware } from "@solidjs/start/middleware";
import { getCookie, getEvent, getHeader } from "vinxi/http";
import { Auth } from "./lib/auth";

const verifyRequestOrigin = (origin: string, hosts: Array<string>) => {
  return hosts.some((h) => h === origin);
};

export default createMiddleware({
  onRequest: async () => {
    const event = getEvent();
    if (event.node.req.method !== "GET") {
      const originHeader = getHeader(event, "Origin") ?? null;
      const hostHeader = getHeader(event, "Host") ?? null;
      // console.log(originHeader, hostHeader);
      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader, import.meta.env.VITE_APP_URL])
      ) {
        event.node.res.writeHead(403).end();
        return;
      }
    }

    const sessionToken = getCookie(event, Auth.SESSION_COOKIE_NAME) ?? null;
    if (!sessionToken) {
      event.context.session = null;
      event.context.user = null;
      return;
    }

    const { session, user } = await Auth.validateSessionToken(sessionToken);

    if (!session) {
      Auth.setSessionCookie(event, "");
      event.context.session = null;
      event.context.user = null;
      return;
    }

    event.context.session = session;
    event.context.user = user;
  },
});

declare module "vinxi/http" {
  interface H3EventContext {
    user: UserSelect | null;
    session: SessionSelect | null;
  }
}
