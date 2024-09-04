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
