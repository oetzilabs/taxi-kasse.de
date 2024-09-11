import type { SendEmail } from "@cloudflare/workers-types";
import { EmailMessage } from "cloudflare:email";
import { Hono } from "hono";
import { createMimeMessage } from "mimetext/browser";
import { Resource } from "sst";

type Bindings = {
  SEB: SendEmail;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/", async (c) => {
  console.log("Sending email");

  const body = await c.req.json();

  const recipient_email = body.recipient_email;
  const recipient_name = body.recipient_name;
  const text = body.text;
  const html = body.html;
  const subject = body.subject;

  if (!recipient_email || !recipient_name || !text || !html || !subject) {
    return c.json({ error: "Missing required fields" }, { status: 400 });
  }

  const m = createMimeMessage();
  m.setSubject(subject);
  m.setSender(`info@${Resource.MainEmail.sender}`);
  m.setTo(recipient_email);
  m.addMessage({ contentType: "text/plain", data: text });
  m.addMessage({ contentType: "text/html", data: html });

  const x = m.asRaw();

  if (!x) {
    return c.json({ error: "Failed to parse email" }, { status: 400 });
  }

  const msg = new EmailMessage(`info@${Resource.MainEmail.sender}`, recipient_email, x);

  try {
    if (!c.env.SEB) {
      return c.json({ error: "SEB not configured" }, { status: 400 });
    }
    await c.env.SEB.send(msg);
  } catch (e: any) {
    return c.json({ error: e.message }, { status: 400 });
  }

  return c.text("Message sent");
});

export default app;
