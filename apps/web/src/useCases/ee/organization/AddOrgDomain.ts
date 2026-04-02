import { z } from "zod";

import { generateVerificationToken, isGouvDomain } from "@/lib/ee/domain-verification";
import { type IOrgDomainRepo } from "@/lib/repo/IOrgDomainRepo";
import { type OrgDomain } from "@/prisma/client";

import { type UseCase } from "../../types";

export const AddOrgDomainInput = z.object({
  organizationId: z.number(),
  domain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/),
});

export type AddOrgDomainInput = z.infer<typeof AddOrgDomainInput>;
export type AddOrgDomainOutput = OrgDomain;

export class AddOrgDomain implements UseCase<AddOrgDomainInput, AddOrgDomainOutput> {
  constructor(private readonly orgDomainRepo: IOrgDomainRepo) {}

  public async execute(input: AddOrgDomainInput): Promise<AddOrgDomainOutput> {
    const existing = await this.orgDomainRepo.findByDomain(input.domain);
    if (existing) {
      throw new Error("Ce domaine est déjà enregistré.");
    }

    const verificationToken = generateVerificationToken();

    return this.orgDomainRepo.create({
      organizationId: input.organizationId,
      domain: input.domain,
      verificationToken,
      isGouv: isGouvDomain(input.domain),
    });
  }
}
