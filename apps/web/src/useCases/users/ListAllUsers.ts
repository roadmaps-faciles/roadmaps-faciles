import { type IUserRepo, type UserWithTenantCount } from "@/lib/repo/IUserRepo";

import { type UseCase } from "../types";

export class ListAllUsers implements UseCase<void, UserWithTenantCount[]> {
  constructor(private readonly repo: IUserRepo) {}

  public async execute(): Promise<UserWithTenantCount[]> {
    return this.repo.findAllWithTenantCount();
  }
}
