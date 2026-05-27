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

import { fetchGitHubRepositories, fetchGitHubRepositorySchema } from "../../actions";
import { useGitHubWizardStore } from "../useGitHubWizardStore";

export const GitHubRepositoryStep = () => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const {
    apiKey,
    authType,
    installationId,
    sourceType,
    repositories,
    selectedRepoId,
    loadingRepos,
    loadingSchema,
    schema,
    goNext,
    goPrev,
    setLoadingRepos,
    setRepositories,
    setSelectedRepoId,
    setLoadingSchema,
    setSchema,
  } = useGitHubWizardStore();

  const [search, setSearch] = useState("");
  const [error, setError] = useState<null | string>(null);

  const filteredRepos = useMemo(() => {
    if (!search.trim()) return repositories;
    const q = search.trim().toLowerCase();
    return repositories.filter(r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
  }, [repositories, search]);

  const authPayload = useMemo(
    () =>
      authType === "app" && installationId
        ? { authType: "app" as const, installationId }
        : { authType: "pat" as const, apiKey },
    [authType, installationId, apiKey],
  );

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const result = await fetchGitHubRepositories(authPayload);
      if (result.ok) {
        setRepositories(result.data);
      } else {
        setError(result.error);
      }
    } finally {
      setLoadingRepos(false);
    }
  }, [authPayload, setLoadingRepos, setRepositories]);

  useEffect(() => {
    if (repositories.length > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount, equivalent to SWR/useQuery
    void loadRepos();
  }, [repositories.length, loadRepos]);

  const handleSelect = useCallback(
    async (repoId: string) => {
      if (repoId === selectedRepoId && schema) return;
      setSelectedRepoId(repoId);
      setLoadingSchema(true);
      setError(null);
      try {
        const repo = repositories.find(r => r.id === repoId);
        if (!repo) return;
        const result = await fetchGitHubRepositorySchema({
          ...authPayload,
          repoFullName: repo.name,
          sourceType,
        });
        if (result.ok) {
          setSchema(result.data);
        } else {
          setError(result.error);
        }
      } finally {
        setLoadingSchema(false);
      }
    },
    [authPayload, sourceType, repositories, selectedRepoId, schema, setSelectedRepoId, setLoadingSchema, setSchema],
  );

  if (loadingRepos) {
    return <p className="text-muted-foreground">{t("loadingRepos")}</p>;
  }

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertDescription>{error || t("noRepos")}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void loadRepos()}>
          <RefreshCw className="mr-1 size-4" />
          {t("refreshRepos")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p>{t("repoDescription")}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goPrev} size="sm">
            {tWizard("cancel")}
          </Button>
          <Button variant="ghost" onClick={() => void loadRepos()} size="sm">
            <RefreshCw className="mr-1 size-4" />
            {t("refreshRepos")}
          </Button>
        </div>
      </div>

      {repositories.length >= 5 && (
        <Input
          placeholder={t("searchRepos")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="search"
          className="my-4"
        />
      )}

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        {filteredRepos.map(repo => {
          const isSelected = selectedRepoId === repo.id;
          return (
            <Card
              key={repo.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${isSelected ? "ring-2 ring-primary" : ""}`}
              onClick={() => void handleSelect(repo.id)}
            >
              <CardHeader className="py-3">
                <CardTitle className="text-base">{repo.name}</CardTitle>
              </CardHeader>
              {(repo.description || isSelected) && (
                <CardContent className="pb-3 pt-0">
                  {repo.description && <p className="text-sm text-muted-foreground">{repo.description}</p>}
                </CardContent>
              )}
              {isSelected && (
                <CardFooter className="pb-3 pt-0">
                  {loadingSchema ? (
                    <p className="text-sm text-muted-foreground">{tWizard("loadingSchema")}</p>
                  ) : schema ? (
                    <Button
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        goNext();
                      }}
                    >
                      {tWizard("next")}
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
