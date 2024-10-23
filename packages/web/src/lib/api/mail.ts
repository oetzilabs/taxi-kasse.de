import { action, redirect } from "@solidjs/router";
import { Email } from "@taxikassede/core/src/entities/mail";
import { getContext } from "../auth/context";

export const sendMail = action(async (to: string) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const testmail = await Email.send("info", to, "test mail from dev stage", "this is a test").catch((e) => {
    console.error(e);
    return null;
  });
  if (!testmail) return false;
  return true;
});
