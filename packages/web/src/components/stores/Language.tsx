import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

// a year
const COOKIE_LANGUAGE_EXPIRES = 31536000 as const;

export const [language, setLanguage] = makePersisted(createSignal("en-US"), {
  name: "language",
  storage: cookieStorage,
  storageOptions: {
    expires: new Date(Date.now() + COOKIE_LANGUAGE_EXPIRES).toUTCString(),
  },
});
