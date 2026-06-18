import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { auth } from "@/lib/next-auth/auth";

import { EmailTestForm } from "./EmailTestForm";

const AdminEmailTestPage = async () => {
  await connection();
  const t = await getTranslations("rootAdmin.emailTest");
  const session = await auth();
  const userEmail = session?.user.email ?? "";

  const { mailer } = config;
  const smtpRows: Array<{ env: string; label: string; value: string }> = [
    { label: t("smtpHost"), env: "MAILER_SMTP_HOST", value: mailer.host },
    { label: t("smtpPort"), env: "MAILER_SMTP_PORT", value: String(mailer.smtp.port) },
    { label: t("smtpSsl"), env: "MAILER_SMTP_SSL", value: mailer.smtp.ssl ? t("enabled") : t("disabled") },
    { label: t("smtpLogin"), env: "MAILER_SMTP_LOGIN", value: mailer.smtp.login || "-" },
    {
      label: t("smtpPassword"),
      env: "MAILER_SMTP_PASSWORD",
      value: mailer.smtp.password ? t("passwordSet") : t("passwordUnset"),
    },
    { label: t("smtpFrom"), env: "MAILER_FROM_EMAIL", value: mailer.from },
  ];

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <details className="mb-8 max-w-xl rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-semibold">{t("smtpConfigTitle")}</summary>
        <p className="mt-3 text-sm text-muted-foreground">{t("smtpConfigDescription")}</p>
        <dl className="mt-4">
          {smtpRows.map(row => (
            <div key={row.env} className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
              <dt className="flex flex-col">
                <span className="text-sm font-medium">{row.label}</span>
                <code className="text-xs text-muted-foreground">{row.env}</code>
              </dt>
              <dd className="text-right text-sm font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <EmailTestForm userEmail={userEmail} />
    </>
  );
};

export default AdminEmailTestPage;
