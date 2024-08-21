import { getCookie, getEvent } from "vinxi/http";
import { lucia } from ".";

export const getContext = async () => {
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return [null, event] as const;
  }
  const luciaContext = await lucia.validateSession(sessionId);
  if (!luciaContext) {
    return [null, event] as const;
  }
  return [luciaContext!, event] as const;
};
