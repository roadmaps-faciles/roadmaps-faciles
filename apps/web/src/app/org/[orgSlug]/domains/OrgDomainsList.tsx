"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getTxtRecordName } from "@/lib/ee/domain-verification-constants";
import { type OrgDomain } from "@/prisma/client";

import { addOrgDomain, removeOrgDomain, verifyOrgDomain } from "./actions";

interface OrgDomainsListProps {
  domains: OrgDomain[];
  orgId: number;
}

export const OrgDomainsList = ({ domains, orgId }: OrgDomainsListProps) => {
  const t = useTranslations("orgAdmin.domains");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);
  const [newDomain, setNewDomain] = useState("");

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addOrgDomain({ organizationId: orgId, domain: newDomain.toLowerCase().trim() });
      if (result.ok) {
        showSuccess(t("added"));
        setNewDomain("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleVerify = (orgDomainId: number) => {
    setError(null);
    startTransition(async () => {
      const result = await verifyOrgDomain({ orgDomainId });
      if (result.ok) {
        showSuccess(t("verified"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemove = (orgDomainId: number, domainName: string) => {
    if (!confirm(t("removeConfirm", { domain: domainName }))) return;
    setError(null);
    startTransition(async () => {
      const result = await removeOrgDomain({ orgDomainId, organizationId: orgId });
      if (result.ok) {
        showSuccess(t("removed"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}

      {/* Add domain form */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium">{t("addDomain")}</h3>
        <p className="text-sm text-muted-foreground">{t("addDescription")}</p>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="new-domain">{t("domainLabel")}</Label>
            <Input
              id="new-domain"
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="example.gouv.fr"
            />
          </div>
          <Button onClick={handleAdd} disabled={isPending || !newDomain.trim()}>
            {t("addSubmit")}
          </Button>
        </div>
      </div>

      {/* Domains list */}
      {domains.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {domains.map(domain => (
            <div key={domain.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{domain.domain}</p>
                  {domain.isGouv && <Badge variant="secondary">.gouv.fr</Badge>}
                  <Badge variant={domain.verifiedAt ? "default" : "outline"}>
                    {domain.verifiedAt ? t("statusVerified") : t("statusPending")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {!domain.verifiedAt && (
                    <Button variant="outline" size="sm" onClick={() => handleVerify(domain.id)} disabled={isPending}>
                      {t("verifyNow")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(domain.id, domain.domain)}
                    disabled={isPending}
                  >
                    {t("remove")}
                  </Button>
                </div>
              </div>

              {/* DNS instructions for unverified domains */}
              {!domain.verifiedAt && (
                <div className="rounded bg-muted p-3 text-sm space-y-2">
                  <p className="font-medium">{t("dnsInstructions")}</p>
                  <div className="font-mono text-xs space-y-1">
                    <p>
                      <span className="text-muted-foreground">Type:</span> TXT
                    </p>
                    <p>
                      <span className="text-muted-foreground">Name:</span> {getTxtRecordName(domain.domain)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Value:</span> {domain.verificationToken}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
