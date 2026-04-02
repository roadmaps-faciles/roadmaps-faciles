import { z } from "zod";

import { verifyDomainTxt } from "@/lib/ee/domain-verification";
import { type IOrganizationRepo } from "@/lib/repo/IOrganizationRepo";
import { type IOrgDomainRepo } from "@/lib/repo/IOrgDomainRepo";
import { type OrgDomain } from "@/prisma/client";
import { OrgPlan } from "@/prisma/enums";

import { type UseCase } from "../../types";

export const VerifyOrgDomainInput = z.object({
  orgDomainId: z.number(),
});

export type VerifyOrgDomainInput = z.infer<typeof VerifyOrgDomainInput>;

export interface VerifyOrgDomainOutput {
  domain: OrgDomain;
  planUpgraded: boolean;
  verified: boolean;
}

export class VerifyOrgDomain implements UseCase<VerifyOrgDomainInput, VerifyOrgDomainOutput> {
  constructor(
    private readonly orgDomainRepo: IOrgDomainRepo,
    private readonly organizationRepo: IOrganizationRepo,
  ) {}

  public async execute(input: VerifyOrgDomainInput): Promise<VerifyOrgDomainOutput> {
    const orgDomain = await this.orgDomainRepo.findById(input.orgDomainId);
    if (!orgDomain) {
      throw new Error("Domaine introuvable.");
    }

    const verified = await verifyDomainTxt(orgDomain.domain, orgDomain.verificationToken);
    if (!verified) {
      return { domain: orgDomain, verified: false, planUpgraded: false };
    }

    const updatedDomain = await this.orgDomainRepo.verify(orgDomain.id);

    // Auto-upgrade to GOV plan if .gouv.fr domain verified
    let planUpgraded = false;
    if (orgDomain.isGouv) {
      const org = await this.organizationRepo.findById(orgDomain.organizationId);
      if (org && org.plan !== OrgPlan.GOV) {
        await this.organizationRepo.update(org.id, { plan: OrgPlan.GOV });
        planUpgraded = true;
      }
    }

    return { domain: updatedDomain, verified: true, planUpgraded };
  }
}
