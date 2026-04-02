import { z } from "zod";

import { type IInvitationRepo } from "@/lib/repo/IInvitationRepo";
import { type Invitation } from "@/prisma/client";

import { type UseCase } from "../types";

export const ListInvitationsForTenantInput = z.object({
  tenantId: z.number(),
});

export type ListInvitationsForTenantInput = z.infer<typeof ListInvitationsForTenantInput>;
export type ListInvitationsForTenantOutput = Invitation[];

export class ListInvitationsForTenant implements UseCase<
  ListInvitationsForTenantInput,
  ListInvitationsForTenantOutput
> {
  constructor(private readonly invitationRepo: IInvitationRepo) {}

  public async execute(input: ListInvitationsForTenantInput): Promise<ListInvitationsForTenantOutput> {
    return this.invitationRepo.findAllForTenant(input.tenantId);
  }
}
