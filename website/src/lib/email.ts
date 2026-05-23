import nodemailer, { type Transporter } from "nodemailer";

export interface Mailer {
  sendMail(opts: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ messageId: string }>;
}

export interface EmailMessage {
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSenderConfig {
  mailer: Mailer;
  from: string;
  to: string;
}

export type EmailSender = (msg: EmailMessage) => Promise<void>;

export function createEmailSender(cfg: EmailSenderConfig): EmailSender {
  return async (msg) => {
    await cfg.mailer.sendMail({
      from: cfg.from,
      to: cfg.to,
      subject: msg.subject,
      text: msg.text,
      ...(msg.html ? { html: msg.html } : {}),
    });
  };
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export function createSmtpMailer(cfg: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}
