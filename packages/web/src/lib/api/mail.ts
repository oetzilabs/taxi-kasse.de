import { action, redirect } from "@solidjs/router";
import { Email } from "@taxikassede/core/src/entities/mail";
import { getContext } from "../auth/context";
import { renderToStringAsync } from "solid-js/web";
import { EmailTemplate } from "~/components/EmailTemplates";

const htmlToText = (text:string) => {
  return text;
}

export const sendMail = action(async (to: string) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const testmail = await Email.sendLegacy(to, "test mail from dev stage", "this is a test").catch((e) => {
    console.error(e);
    return null;
  });
  if (!testmail) return false;
  return true;
});

export const send = action(async (to:string) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const html = await renderToStringAsync(EmailTemplate);

  const testmail = await Email.sendLegacy2({
    to,
    html,
    text: htmlToText(html),
    subject: "test"
  }).catch((e) => {
    console.error(e);
    return null;
  });
  if (!testmail) return false;
  return true;

});
