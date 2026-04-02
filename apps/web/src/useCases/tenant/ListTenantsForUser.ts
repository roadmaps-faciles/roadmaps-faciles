import { z } from "zod";

import { TenantWithSettings } from "@/lib/model/Tenant";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";

import { type UseCase } from "../types";

export const ListTenantsForUserInput = z.object({
  userId: z.string(),
});

export type ListTenantsForUserInput = z.infer<typeof ListTenantsForUserInput>;
export type ListTenantsForUserOutput = TenantWithSettings[];

export class ListTenantsForUser implements UseCase<ListTenantsForUserInput, ListTenantsForUserOutput> {
  constructor(private readonly tenantRepo: ITenantRepo) {}

  public async execute(input: ListTenantsForUserInput): Promise<ListTenantsForUserOutput> {
    const results = await this.tenantRepo.findAllForUser(input.userId);
    return results.map(t => TenantWithSettings.parse(t));
  }
}
