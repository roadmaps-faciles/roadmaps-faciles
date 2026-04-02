import { z } from "zod";

import { type IOrgDomainRepo } from "@/lib/repo/IOrgDomainRepo";

import { type UseCase } from "../../types";

export const RemoveOrgDomainInput = z.object({
  orgDomainId: z.number(),
  organizationId: z.number(),
});

export type RemoveOrgDomainInput = z.infer<typeof RemoveOrgDomainInput>;
export type RemoveOrgDomainOutput = void;

export class RemoveOrgDomain implements UseCase<RemoveOrgDomainInput, RemoveOrgDomainOutput> {
  constructor(private readonly orgDomainRepo: IOrgDomainRepo) {}

  public async execute(input: RemoveOrgDomainInput): Promise<RemoveOrgDomainOutput> {
    const domain = await this.orgDomainRepo.findById(input.orgDomainId);
    if (!domain) {
      throw new Error("Domaine introuvable.");
    }

    // Validate the domain belongs to the organization
    if (domain.organizationId !== input.organizationId) {
      throw new Error("Ce domaine n'appartient pas à cette organisation.");
    }

    await this.orgDomainRepo.delete(domain.id);
  }
}
