"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

type ConfigEntry = { key: string; masked: boolean; value: string };
type ConfigSection = { entries: ConfigEntry[]; section: string };

interface ConfigViewProps {
  sections: ConfigSection[];
}

export const ConfigView = ({ sections }: ConfigViewProps) => {
  const t = useTranslations("rootAdmin.config");

  return (
    <div className="space-y-6">
      {sections.map(({ section, entries }) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-base font-semibold capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {entries.map(({ key, value, masked }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <code className="text-muted-foreground font-mono text-xs">{key}</code>
                  <div className="flex items-center gap-2 shrink-0">
                    {masked && (
                      <Badge variant="secondary" className="text-[10px]">
                        {t("masked")}
                      </Badge>
                    )}
                    <span className={`font-mono text-xs ${value ? "" : "text-muted-foreground italic"}`}>
                      {value || t("empty")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
