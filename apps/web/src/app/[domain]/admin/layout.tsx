import { SidebarInset, SidebarProvider, SidebarTrigger } from "@roadmaps-faciles/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { DefaultThemeForcer } from "@/ui/DefaultThemeForcer";
import { UIProvider } from "@/ui/UIContext";
import { assertTenantAdmin } from "@/utils/auth";
import { getTenantFromDomain } from "@/utils/tenant";
import { getUserMenuContext } from "@/utils/userMenuContext";

import { AdminSideMenu } from "./AdminSideMenu";

const TenantAdminLayout = async ({ children, params }: LayoutProps<"/[domain]/admin">) => {
  await connection();
  const session = await auth();
  if (!session) redirect("/login");

  const pathname = (await headers()).get("x-pathname") || "";
  if (session.twoFactorRequired && !session.user.twoFactorEnabled && !pathname.startsWith("/profile/security")) {
    redirect("/profile/security");
  }
  if (session.twoFactorRequired && !session.twoFactorVerified) {
    redirect("/2fa");
  }

  const { domain } = await params;
  await assertTenantAdmin(domain);

  const tenant = await getTenantFromDomain(domain);
  const [pendingModerationCount, tenantSettings, userMenu] = await Promise.all([
    prisma.post.count({
      where: { tenantId: tenant.id, approvalStatus: POST_APPROVAL_STATUS.PENDING },
    }),
    prisma.tenantSettings.findUniqueOrThrow({
      where: { tenantId: tenant.id },
      select: { name: true },
    }),
    getUserMenuContext({ session, currentTenantId: tenant.id }),
  ]);

  return (
    <UIProvider value="Default">
      <DefaultThemeForcer />
      <SidebarProvider>
        <AdminSideMenu
          tenantName={tenantSettings.name}
          pendingModerationCount={pendingModerationCount}
          userMenu={userMenu}
        />
        <SidebarInset id="content" className="max-h-svh overflow-x-hidden overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4 md:hidden">
            <span className="truncate text-sm font-semibold">{tenantSettings.name}</span>
            <SidebarTrigger className="ml-auto" />
          </header>
          <div className="px-6 py-8 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UIProvider>
  );
};

export default TenantAdminLayout;
