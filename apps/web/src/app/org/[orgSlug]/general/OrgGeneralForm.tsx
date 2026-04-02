"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { type Organization } from "@/prisma/client";
import { formatDateHour } from "@/utils/date";

import { deleteOrganization, updateOrganization } from "./actions";

const PLAN_LABELS = {
  FREE: "planFree",
  ORGANIZATION: "planOrganization",
  GRANTED_FREE: "planGrantedFree",
  GOV: "planGov",
} as const;

interface OrgGeneralFormProps {
  canEdit?: boolean;
  org: Organization;
}

export const OrgGeneralForm = ({ org, canEdit = false }: OrgGeneralFormProps) => {
  const t = useTranslations("orgAdmin.general");
  const locale = useLocale();
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState<null | string>(null);
  const [deletePending, setDeletePending] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    setPending(true);

    const result = await updateOrganization({
      orgId: org.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
    });

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(result.error);
    }
    setPending(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("saveError")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>{t("saved")}</AlertTitle>
        </Alert>
      )}
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" defaultValue={org.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">{t("slug")}</Label>
          <Input id="slug" name="slug" defaultValue={org.slug} required pattern="^[a-z0-9-]+$" />
        </div>
        <div className="space-y-2">
          <Label>{t("plan")}</Label>
          <div>
            <Badge variant="outline">{t(PLAN_LABELS[org.plan as keyof typeof PLAN_LABELS] ?? "planFree")}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("createdAt")}</Label>
          <p className="text-sm text-muted-foreground">{formatDateHour(org.createdAt, locale)}</p>
        </div>
        {canEdit && (
          <Button type="submit" disabled={pending}>
            {t("save")}
          </Button>
        )}
      </form>
      {/* Danger zone */}
      {canEdit && (
        <div className="mt-12 space-y-4 rounded-lg border border-destructive/30 p-6">
          <h3 className="text-lg font-semibold text-destructive">{t("delete")}</h3>
          <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
          {deleteError && (
            <Alert variant="destructive">
              <AlertTitle>{t("saveError")}</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">{t("deleteConfirm", { slug: org.slug })}</Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={org.slug}
            />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== org.slug || deletePending}
            onClick={async () => {
              setDeleteError(null);
              setDeletePending(true);
              const result = await deleteOrganization(org.id, deleteConfirm);
              if (result.ok) {
                window.location.href = "/";
              } else {
                setDeleteError(result.error);
              }
              setDeletePending(false);
            }}
          >
            {t("delete")}
          </Button>
        </div>
      )}
    </div>
  );
};
