import { z } from "zod";

import { type IUserOnTenantRepo, type UserOnTenantWithUser } from "@/lib/repo/IUserOnTenantRepo";

import { type UseCase } from "../types";

export const ListUsersForTenantInput = z.object({ tenantId: z.number() });
export type ListUsersForTenantInput = z.infer<typeof ListUsersForTenantInput>;

export class ListUsersForTenant implements UseCase<ListUsersForTenantInput, UserOnTenantWithUser[]> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: ListUsersForTenantInput): Promise<UserOnTenantWithUser[]> {
    return this.repo.findByTenantId(input.tenantId);
  }
}
