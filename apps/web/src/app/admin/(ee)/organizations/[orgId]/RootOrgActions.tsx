"use client";

import { Alert, Badge, Button, Input } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ADDON_TYPE, ORG_PLAN } from "@/lib/model/Organization";
import { type OrgAddon, type Organization } from "@/prisma/client";

import { deleteOrganizationAdmin, toggleOrgAddonAdmin, updateOrgPlan } from "./actions";

interface RootOrgActionsProps {
  activeAddons: OrgAddon[];
  org: Organization;
}

export const RootOrgActions = ({ activeAddons, org }: RootOrgActionsProps) => {
  const activeAddonSet = new Set<string>(activeAddons.filter(a => a.active).map(a => a.addon));
  const t = useTranslations("adminOrganizations");
  const [selectedPlan, setSelectedPlan] = useState(org.plan);
  const [reason, setReason] = useState("");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePlanUpdate = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateOrgPlan({ orgId: org.id, plan: selectedPlan, reason: reason || undefined });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(t("planUpdated"));
        setTimeout(() => setSuccess(null), 5000);
      }
    });
  };

  const handleAddonToggle = (addon: string, active: boolean) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await toggleOrgAddonAdmin({
        orgId: org.id,
        addon: addon as keyof typeof ADDON_TYPE,
        active,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(t("addonToggled"));
        setTimeout(() => setSuccess(null), 5000);
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await deleteOrganizationAdmin({ orgId: org.id, confirmSlug });
      if (!result.ok) {
        setError(result.error);
      } else {
        router.push("/admin/organizations");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert>{success}</Alert>}

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("changePlan")}</h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("plan")}</label>
            <select
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value as keyof typeof ORG_PLAN)}
              className="rounded-md border px-3 py-2 text-sm"
              disabled={isPending}
            >
              {Object.keys(ORG_PLAN).map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">{t("reason")}</label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              disabled={isPending}
            />
          </div>
          <Button onClick={handlePlanUpdate} disabled={isPending || selectedPlan === org.plan}>
            {t("updatePlan")}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("overrideAddons")}</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ADDON_TYPE).map(addon => {
            const isActive = activeAddonSet.has(addon);
            return (
              <Button
                key={addon}
                variant={isActive ? "default" : "outline"}
                size="sm"
                disabled={isPending}
                onClick={() => handleAddonToggle(addon, !isActive)}
              >
                <Badge variant={isActive ? "default" : "secondary"} className="mr-1">
                  {addon}
                </Badge>
                {isActive ? t("deactivate") : t("activate")}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-destructive p-4">
        <h2 className="mb-4 text-xl font-semibold text-destructive">{t("dangerZone")}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{t("deleteWarning", { slug: org.slug })}</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">{t("confirmSlug")}</label>
            <Input
              value={confirmSlug}
              onChange={e => setConfirmSlug(e.target.value)}
              placeholder={org.slug}
              disabled={isPending}
            />
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending || confirmSlug !== org.slug}>
            {t("deleteOrg")}
          </Button>
        </div>
      </div>
    </div>
  );
};
