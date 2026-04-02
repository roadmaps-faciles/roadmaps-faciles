import { type ITenantRepo, type TenantWithSettingsAndMemberCount } from "@/lib/repo/ITenantRepo";

import { type UseCase } from "../types";

export class ListAllTenants implements UseCase<void, TenantWithSettingsAndMemberCount[]> {
  constructor(private readonly repo: ITenantRepo) {}

  public async execute(): Promise<TenantWithSettingsAndMemberCount[]> {
    return this.repo.findAllWithSettings();
  }
}
