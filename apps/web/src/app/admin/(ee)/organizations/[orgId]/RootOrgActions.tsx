"use client";

import { Badge, Button, Input, toast } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ADDON_TYPE, FREE_TIER_ADDONS, ORG_PLAN } from "@/lib/model/Organization";
import { type OrgAddon, type Organization } from "@/prisma/client";

import { deleteOrganizationAdmin, resetOrgAddonsAdmin, toggleOrgAddonAdmin, updateOrgPlan } from "./actions";

interface RootOrgActionsProps {
  activeAddons: OrgAddon[];
  org: Organization;
  /** Self-host: org plan is meaningless (entitlements come from the instance license). */
  selfHost: boolean;
}

export const RootOrgActions = ({ activeAddons, org, selfHost }: RootOrgActionsProps) => {
  // Cloud (allowlist): addon is on iff an active:true row exists. Self-host (denylist): addon is on by
  // default (license covers it), off iff an explicit active:false row disables it.
  const activeAddonSet = new Set<string>(activeAddons.filter(a => a.active).map(a => a.addon));
  const disabledAddonSet = new Set<string>(activeAddons.filter(a => !a.active).map(a => a.addon));
  const t = useTranslations("adminOrganizations");
  const [selectedPlan, setSelectedPlan] = useState(org.plan);
  const [reason, setReason] = useState("");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePlanUpdate = () => {
    startTransition(async () => {
      const result = await updateOrgPlan({ orgId: org.id, plan: selectedPlan, reason: reason || undefined });
      if (!result.ok) toast.error(result.error);
      else toast.success(t("planUpdated"));
    });
  };

  const handleAddonToggle = (addon: string, active: boolean) => {
    startTransition(async () => {
      const result = await toggleOrgAddonAdmin({ orgId: org.id, addon: addon as keyof typeof ADDON_TYPE, active });
      if (!result.ok) toast.error(result.error);
      else toast.success(t("addonToggled"));
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetOrgAddonsAdmin(org.id);
      if (!result.ok) toast.error(result.error);
      else toast.success(t("addonFilterReset"));
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrganizationAdmin({ orgId: org.id, confirmSlug });
      if (!result.ok) toast.error(result.error);
      else router.push("/admin/organizations");
    });
  };

  return (
    <div className="space-y-6">
      {!selfHost && (
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
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{selfHost ? t("addonFilter") : t("overrideAddons")}</h2>
          {selfHost && (
            <Button variant="outline" size="sm" disabled={isPending} onClick={handleReset}>
              {t("resetAddonFilter")}
            </Button>
          )}
        </div>
        {selfHost && <p className="mb-3 text-sm text-muted-foreground">{t("addonFilterHint")}</p>}
        <div className="flex flex-wrap gap-2">
          {/* Self-host denylist: free-tier addons are always on and can't be disabled, so hide them. */}
          {Object.keys(ADDON_TYPE)
            .filter(addon => !(selfHost && FREE_TIER_ADDONS.has(addon as keyof typeof ADDON_TYPE)))
            .map(addon => {
              // Self-host: on unless explicitly disabled. Cloud: on iff explicitly active.
              const isOn = selfHost ? !disabledAddonSet.has(addon) : activeAddonSet.has(addon);
              return (
                <Button
                  key={addon}
                  variant={isOn ? "default" : "outline"}
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleAddonToggle(addon, !isOn)}
                >
                  <Badge variant={isOn ? "default" : "secondary"} className="mr-1">
                    {addon}
                  </Badge>
                  {isOn ? t("deactivate") : t("activate")}
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
