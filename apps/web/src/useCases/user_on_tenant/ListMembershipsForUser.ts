import { z } from "zod";

import { type UserOnTenantWithTenantSettings, type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";

import { type UseCase } from "../types";

export const ListMembershipsForUserInput = z.object({ userId: z.string() });
export type ListMembershipsForUserInput = z.infer<typeof ListMembershipsForUserInput>;
export type ListMembershipsForUserOutput = UserOnTenantWithTenantSettings[];

export class ListMembershipsForUser implements UseCase<ListMembershipsForUserInput, ListMembershipsForUserOutput> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: ListMembershipsForUserInput): Promise<ListMembershipsForUserOutput> {
    return this.repo.findByUserIdWithSettings(input.userId);
  }
}
