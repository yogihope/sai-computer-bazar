import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Sai Computers"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}

export async function sendBulkEmails(
  recipients: { email: string; name?: string }[],
  subject: string,
  htmlTemplate: string,
  batchSize: number = 10
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const promises = batch.map(async (recipient) => {
      const personalizedHtml = htmlTemplate
        .replace(/\{\{name\}\}/g, recipient.name || "Customer")
        .replace(/\{\{email\}\}/g, recipient.email);

      const result = await sendEmail({
        to: recipient.email,
        subject,
        html: personalizedHtml,
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
      }
    });

    await Promise.all(promises);

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export function createEmailTemplate(
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Sai Computers</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 20px; font-weight: 600;">${title}</h2>
              <div style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
              ${buttonText && buttonUrl ? `
              <div style="margin-top: 32px;">
                <a href="${buttonUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${buttonText}</a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #71717a; font-size: 14px; text-align: center;">
                &copy; ${new Date().getFullYear()} Sai Computers. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                You're receiving this email because you're a valued customer or have made an inquiry.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
