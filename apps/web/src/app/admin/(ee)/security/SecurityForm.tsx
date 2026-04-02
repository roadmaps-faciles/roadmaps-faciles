"use client";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveSecuritySettings } from "./actions";

interface SecurityFormProps {
  force2FA: boolean;
  force2FAGraceDays: number;
}

export const SecurityForm = ({ force2FA, force2FAGraceDays }: SecurityFormProps) => {
  const t = useTranslations("rootAdmin.security");
  const tc = useTranslations("common");
  const router = useRouter();
  const [enabled, setEnabled] = useState(force2FA);
  const [graceDays, setGraceDays] = useState(force2FAGraceDays);

  const graceOptions = Array.from({ length: 6 }, (_, i) => ({
    label: i === 0 ? t("immediate") : t("days", { count: i }),
    value: String(i),
  }));

  const handleSave = async () => {
    await saveSecuritySettings({ force2FA: enabled, force2FAGraceDays: graceDays });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="force-2fa">{t("force2FAToggle")}</Label>
        <Switch id="force-2fa" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-2">
          <Label htmlFor="grace-period">{t("gracePeriod")}</Label>
          <Select value={String(graceDays)} onValueChange={v => setGraceDays(Number(v))}>
            <SelectTrigger id="grace-period" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {graceOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={() => void handleSave()}>{tc("save")}</Button>
    </div>
  );
};
