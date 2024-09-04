import { EmailMessage } from "cloudflare:email";
import { Hono } from "hono";
import { Resource } from "sst";

interface EmailOptions {
  date?: string; // Optional date, if not provided, it will default to the current date.
  messageId?: string; // Optional message ID, if not provided, a unique one can be generated.
  mimeVersion?: string; // Optional MIME version, default is "1.0".
  contentType?: string; // Optional content type, default is "multipart/mixed".
  boundary?: string; // Optional boundary string, if not provided, a unique one can be generated.
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: {
    filename: string;
    contentType: string;
    content: string;
    disposition?: string; // Optional content disposition, default is "attachment".
    contentId?: string; // Optional content ID, required for inline images.
  }[];
}

function createEmail({
  date = new Date().toUTCString(),
  messageId,
  mimeVersion = "1.0",
  contentType = "multipart/mixed",
  boundary,
  from,
  to,
  subject,
  text,
  html,
  attachments = [],
}: EmailOptions): string {
  const generatedBoundary = boundary || `----boundary${Math.random().toString(36).substring(2)}`;
  const generatedMessageId = messageId || `<${Math.random().toString(36).substring(2)}@example.com>`;

  let email = `
Date: ${date}
From: ${from}
To: ${to}
Message-ID: ${generatedMessageId}
Subject: ${subject}
MIME-Version: ${mimeVersion}
Content-Type: ${contentType}; boundary=${generatedBoundary}

--${generatedBoundary}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

${text}

--${generatedBoundary}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

${html}
`;

  attachments.forEach(({ filename, contentType, content, disposition = "attachment", contentId }) => {
    const attachmentBoundary = `--${generatedBoundary}`;
    const contentIdLine = contentId ? `Content-ID: <${contentId}>\n` : "";

    email += `
${attachmentBoundary}
Content-Type: ${contentType}; name="${filename}"
Content-Transfer-Encoding: base64
Content-Disposition: ${disposition}; filename="${filename}"
${contentIdLine}
${content}
`;
  });

  email += `--${generatedBoundary}--`;

  return email.trim();
}

const app = new Hono();

app.post("/", async (c) => {
  console.log("Sending email");

  const b = await c.req.raw;

  const body = await c.req.json();

  const recipient_email = body.recipient_email;
  const recipient_name = body.recipient_name;
  const text = body.text;
  const html = body.html;
  const subject = body.subject;

  if (!recipient_email || !recipient_name || !text || !html || !subject) {
    return c.json({ error: "Missing required fields" }, { status: 400 });
  }

  const x = createEmail({
    from: `info@${Resource.MainEmail.sender}`,
    to: recipient_email,
    subject,
    text,
    html,
  });

  if (!x) {
    return c.json({ error: "Failed to parse email" }, { status: 400 });
  }

  const msg = new EmailMessage(`info@${Resource.MainEmail.sender}`, recipient_email, x);

  try {
    // @ts-ignore
    await env.SEB.send(msg);
  } catch (e: any) {
    return c.json({ error: e.message }, { status: 400 });
  }

  return c.text("Message sent");
});

export default app;
