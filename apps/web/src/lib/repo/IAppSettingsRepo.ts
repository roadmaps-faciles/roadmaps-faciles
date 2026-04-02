import { type AppSettings } from "@/prisma/client";

export interface IAppSettingsRepo {
  get(): Promise<AppSettings>;
  update(
    data: Partial<
      Pick<AppSettings, "featureFlags" | "force2FA" | "force2FAGraceDays" | "pinnedTenantId" | "rootOAuthProviders">
    >,
  ): Promise<AppSettings>;
}
