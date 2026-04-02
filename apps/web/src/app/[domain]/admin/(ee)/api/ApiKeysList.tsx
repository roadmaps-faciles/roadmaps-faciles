"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type ApiKey } from "@/prisma/client";

import { createApiKey, deleteApiKey } from "./actions";

interface ApiKeysListProps {
  apiKeys: ApiKey[];
}

export const ApiKeysList = ({ apiKeys: initialApiKeys }: ApiKeysListProps) => {
  const t = useTranslations("domainAdmin.api");
  const tc = useTranslations("common");
  const locale = useLocale();
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [newToken, setNewToken] = useState<null | string>(null);

  const handleCreate = async () => {
    const result = await createApiKey();
    if (result.ok && result.data) {
      setApiKeys([result.data.apiKey, ...apiKeys]);
      setNewToken(result.data.token);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tc("areYouSure"))) return;
    const result = await deleteApiKey({ id });
    if (result.ok) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  return (
    <div>
      {newToken && (
        <Alert className="mb-6">
          <AlertTitle>{t("newKeyCreated")}</AlertTitle>
          <AlertDescription>{t("newKeyMessage", { token: newToken })}</AlertDescription>
        </Alert>
      )}

      {apiKeys.length > 0 ? (
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>{t("prefix")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead>{tc("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map(apiKey => (
              <TableRow key={apiKey.id}>
                <TableCell>
                  <code className="text-sm">
                    {apiKey.commonTokenPrefix}…{apiKey.randomTokenPrefix}
                  </code>
                </TableCell>
                <TableCell>{dateFormatter.format(new Date(apiKey.createdAt))}</TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" onClick={() => void handleDelete(apiKey.id)}>
                    {tc("revoke")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Alert className="mb-6">
          <AlertTitle>{t("noKeys")}</AlertTitle>
          <AlertDescription>{t("noKeysDescription")}</AlertDescription>
        </Alert>
      )}

      <Button onClick={() => void handleCreate()}>{t("createKey")}</Button>
    </div>
  );
};
