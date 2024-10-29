import { action } from "@solidjs/router";
import { Email } from "@taxikassede/core/src/entities/mail";
import { EmailTemplate } from "~/components/EmailTemplates";
import { renderToStringAsync } from "solid-js/web";
import { ensureAuthenticated } from "../auth/context";

const htmlToText = (text: string) => {
  return text;
};

export const sendMail = action(async (to: string) => {
  "use server";
  const [ctx] = await ensureAuthenticated();

  const testmail = await Email.sendLegacy(to, "test mail from dev stage", "this is a test").catch((e) => {
    console.error(e);
    return null;
  });
  if (!testmail) return false;
  return true;
});

export const send = action(async (to: string) => {
  "use server";
  const [ctx] = await ensureAuthenticated();

  const html = await renderToStringAsync(EmailTemplate);

  const testmail = await Email.sendLegacy2({
    to,
    html,
    text: htmlToText(html),
    subject: "test",
  }).catch((e) => {
    console.error(e);
    return null;
  });
  if (!testmail) return false;
  return true;
});
