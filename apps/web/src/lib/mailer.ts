import "server-only";
import nodemailer from "nodemailer";

import { config } from "@/config";

export const createMailTransporter = () =>
  nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.smtp.port,
    secure: config.mailer.smtp.ssl,
    auth:
      config.mailer.smtp.login && config.mailer.smtp.password
        ? { user: config.mailer.smtp.login, pass: config.mailer.smtp.password }
        : undefined,
  });

export const sendEmail = async (options: { html: string; subject: string; text: string; to: string }) => {
  const transporter = createMailTransporter();
  await transporter.sendMail({ from: config.mailer.from, ...options });
};
