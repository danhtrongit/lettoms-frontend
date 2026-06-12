import "server-only";
import nodemailer from "nodemailer";
import type { EmailSettings } from "@/db/schema/cms";
import { getSettings } from "@/lib/repos/settings.repo";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

export type SendResult =
  | { ok: true }
  | { ok: false; error: string };

/** Build a nodemailer transport from the provided SMTP settings. */
function buildTransport(cfg: EmailSettings) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
}

function isConfigured(cfg?: EmailSettings): cfg is EmailSettings {
  return Boolean(cfg && cfg.enabled && cfg.host && cfg.fromEmail);
}

/**
 * Send an email using the SMTP settings stored in site settings.
 * If SMTP is not configured, logs the message and returns ok (no-op)
 * so order flows never fail because email is missing.
 */
export async function sendMail(msg: MailMessage): Promise<SendResult> {
  const settings = await getSettings();
  const cfg = settings.emailSettings;

  if (!isConfigured(cfg)) {
    console.info(`[email] SMTP not configured — skipped mail to ${msg.to}: ${msg.subject}`);
    return { ok: true };
  }

  try {
    const transport = buildTransport(cfg);
    await transport.sendMail({
      from: `"${cfg.fromName || "Letom's"}" <${cfg.fromEmail}>`,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "send_failed";
    console.error(`[email] failed to send to ${msg.to}:`, error);
    return { ok: false, error };
  }
}

/** Send a test email to verify SMTP configuration (uses explicit config). */
export async function sendTestMail(
  cfg: EmailSettings,
  to: string
): Promise<SendResult> {
  if (!cfg.host || !cfg.fromEmail) {
    return { ok: false, error: "Thiếu cấu hình SMTP (host/email gửi)" };
  }
  try {
    const transport = buildTransport(cfg);
    await transport.sendMail({
      from: `"${cfg.fromName || "Letom's"}" <${cfg.fromEmail}>`,
      to,
      subject: "Letom's — Email thử nghiệm",
      html: `<p>Đây là email thử nghiệm từ Letom's. Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động.</p>`,
    });
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "send_failed";
    return { ok: false, error };
  }
}
