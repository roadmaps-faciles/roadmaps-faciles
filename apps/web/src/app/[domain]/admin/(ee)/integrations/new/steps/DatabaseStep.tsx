"use client";

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@roadmaps-faciles/ui";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchNotionDatabases, fetchNotionDatabaseSchema } from "../../actions";
import { useNotionWizardStore } from "../useNotionWizardStore";

export const DatabaseStep = () => {
  const t = useTranslations("domainAdmin.integrations.wizard");
  const {
    apiKey,
    databases,
    selectedDatabaseId,
    loadingDatabases,
    loadingSchema,
    schema,
    goNext,
    goPrev,
    setLoadingDatabases,
    setDatabases,
    setSelectedDatabaseId,
    setLoadingSchema,
    setSchema,
  } = useNotionWizardStore();

  const [search, setSearch] = useState("");

  const filteredDatabases = useMemo(() => {
    if (!search.trim()) return databases;
    const q = search.trim().toLowerCase();
    return databases.filter(db => db.name.toLowerCase().includes(q) || db.parentName?.toLowerCase().includes(q));
  }, [databases, search]);

  const loadDatabases = useCallback(async () => {
    setLoadingDatabases(true);
    try {
      const result = await fetchNotionDatabases({ apiKey });
      if (result.ok) {
        setDatabases(result.data);
      }
    } finally {
      setLoadingDatabases(false);
    }
  }, [apiKey, setLoadingDatabases, setDatabases]);

  useEffect(() => {
    if (databases.length > 0) return;
    void loadDatabases();
  }, [databases.length, loadDatabases]);

  const handleSelect = useCallback(
    async (databaseId: string) => {
      if (databaseId === selectedDatabaseId && schema) return;
      setSelectedDatabaseId(databaseId);
      setLoadingSchema(true);
      try {
        const result = await fetchNotionDatabaseSchema({ apiKey, databaseId });
        if (result.ok) {
          setSchema(result.data);
        }
      } finally {
        setLoadingSchema(false);
      }
    },
    [apiKey, selectedDatabaseId, schema, setSelectedDatabaseId, setLoadingSchema, setSchema],
  );

  if (loadingDatabases) {
    return <p className="text-muted-foreground">{t("loadingDatabases")}</p>;
  }

  if (databases.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("noDatabases")}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void loadDatabases()}>
          <RefreshCw className="mr-1 size-4" />
          {t("refreshDatabases")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p>{t("databaseDescription")}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goPrev} size="sm">
            {t("cancel")}
          </Button>
          <Button variant="ghost" onClick={() => void loadDatabases()} size="sm">
            <RefreshCw className="mr-1 size-4" />
            {t("refreshDatabases")}
          </Button>
        </div>
      </div>

      {databases.length >= 5 && (
        <Input
          placeholder={t("searchDatabases")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="search"
          className="my-4"
        />
      )}

      <div className="flex flex-col gap-2">
        {filteredDatabases.map(db => {
          const isSelected = selectedDatabaseId === db.id;
          return (
            <Card
              key={db.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${isSelected ? "ring-2 ring-primary" : ""}`}
              onClick={() => void handleSelect(db.id)}
            >
              <CardHeader className="py-3">
                <CardTitle className="text-base">
                  {db.icon?.type === "emoji" && <span className="mr-2">{db.icon.emoji}</span>}
                  {db.icon?.type === "url" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={db.icon.url} alt="" className="mr-2 inline-block size-5" />
                  )}
                  {db.name}
                  {db.parentName && <span className="ml-2 text-sm text-muted-foreground">({db.parentName})</span>}
                </CardTitle>
              </CardHeader>
              {(db.description || isSelected) && (
                <CardContent className="pb-3 pt-0">
                  {db.description && <p className="text-sm text-muted-foreground">{db.description}</p>}
                  <p className="text-xs text-muted-foreground">{t("propertyCount", { count: db.propertyCount })}</p>
                </CardContent>
              )}
              {isSelected && (
                <CardFooter className="pb-3 pt-0">
                  {loadingSchema ? (
                    <p className="text-sm text-muted-foreground">{t("loadingSchema")}</p>
                  ) : schema ? (
                    <Button
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        goNext();
                      }}
                    >
                      {t("next")}
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  ) : null}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
