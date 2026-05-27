"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@roadmaps-faciles/ui";
import { Eye, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { type UiTheme } from "@/ui/types";

import { type ColorMode, type EmailTemplate, previewEmail, sendTestEmail } from "./actions";

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

const COLOR_MODES: Array<{ label: string; value: ColorMode }> = [
  { value: "auto", label: "Auto (préférence client)" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface EmailTestFormProps {
  userEmail: string;
}

export const EmailTestForm = ({ userEmail }: EmailTestFormProps) => {
  const t = useTranslations("rootAdmin.emailTest");
  const [isSending, startSendTransition] = useTransition();
  const [isPreviewing, startPreviewTransition] = useTransition();
  const [template, setTemplate] = useState<EmailTemplate>("magicLink");
  const [theme, setTheme] = useState<UiTheme>("Default");
  const [colorMode, setColorMode] = useState<ColorMode>("auto");
  const [recipient, setRecipient] = useState(userEmail);
  const [previewHtml, setPreviewHtml] = useState<null | string>(null);

  const handlePreview = () => {
    startPreviewTransition(async () => {
      const result = await previewEmail({ template, theme, colorMode });
      if (result.ok) {
        setPreviewHtml(result.data);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSend = () => {
    startSendTransition(async () => {
      const result = await sendTestEmail({ template, theme, colorMode, recipient });
      if (result.ok) {
        toast.success(t("sent", { email: recipient }));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("sendTest")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

              <div className="space-y-2">
                <Label>{t("colorMode")}</Label>
                <Select value={colorMode} onValueChange={v => setColorMode(v as ColorMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_MODES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("recipient")}</Label>
              <Input
                type="email"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview} disabled={isPreviewing}>
                <Eye className="mr-2 size-4" />
                {isPreviewing ? t("previewing") : t("preview")}
              </Button>
              <Button onClick={handleSend} disabled={isSending || !recipient.trim()}>
                <Send className="mr-2 size-4" />
                {isSending ? t("sending") : t("send")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t("previewTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              srcDoc={previewHtml}
              className="w-full rounded-sm border"
              style={{ height: "600px", colorScheme: "auto" }}
              sandbox=""
              title="Email preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
