"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@roadmaps-faciles/ui";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { type UiTheme } from "@/ui/types";

import { type EmailTemplate, sendTestEmail } from "./actions";

const TEMPLATES: Array<{ label: string; value: EmailTemplate }> = [
  { value: "magicLink", label: "Magic Link" },
  { value: "invitation", label: "Invitation" },
  { value: "verifyEmail", label: "Vérification email" },
  { value: "resetPassword", label: "Réinitialisation mot de passe" },
  { value: "emLinkConfirm", label: "Liaison Espace Membre" },
];

const THEMES: Array<{ label: string; value: UiTheme }> = [
  { value: "Default", label: "Default (Roadmaps Faciles)" },
  { value: "Dsfr", label: "DSFR (Gouvernemental)" },
];

interface EmailTestFormProps {
  userEmail: string;
}

export const EmailTestForm = ({ userEmail }: EmailTestFormProps) => {
  const t = useTranslations("rootAdmin.emailTest");
  const [isPending, startTransition] = useTransition();
  const [template, setTemplate] = useState<EmailTemplate>("magicLink");
  const [theme, setTheme] = useState<UiTheme>("Default");

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await sendTestEmail({ template, theme });
      if (result.ok) {
        toast.success(t("sent"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("sendTest")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("recipient")}</Label>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono">{userEmail}</code>
              <Badge variant="secondary" className="text-[10px]">
                {t("currentUser")}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("template")}</Label>
            <Select value={template} onValueChange={v => setTemplate(v as EmailTemplate)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("theme")}</Label>
            <Select value={theme} onValueChange={v => setTheme(v as UiTheme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={isPending}>
            <Send className="mr-2 size-4" />
            {isPending ? t("sending") : t("send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
