import { z } from "zod";

import { type UserOnTenant as Membership, UserOnTenant } from "@/lib/model/UserOnTenant";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";

import { type UseCase } from "../types";

export const ListTenantsForUserInput = z.object({ userId: z.string() });
export type ListTenantsForUserInput = z.infer<typeof ListTenantsForUserInput>;
export type ListTenantsForUserOutput = Membership[];

export class ListTenantsForUser implements UseCase<ListTenantsForUserInput, ListTenantsForUserOutput> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: ListTenantsForUserInput): Promise<ListTenantsForUserOutput> {
    const results = await this.repo.findByUserId(input.userId);
    return results.map(r => UserOnTenant.parse(r));
  }
}
