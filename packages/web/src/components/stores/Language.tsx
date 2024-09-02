import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

export const [language, setLanguage] = makePersisted(createSignal("en-US"), {
  name: "language",
  storage: cookieStorage,
});
