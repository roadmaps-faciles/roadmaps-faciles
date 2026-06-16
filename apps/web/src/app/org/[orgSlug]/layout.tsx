import { SidebarInset, SidebarProvider, SidebarTrigger } from "@roadmaps-faciles/ui";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { config } from "@/config";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { auth } from "@/lib/next-auth/auth";
import { organizationRepo } from "@/lib/repo";
import { DefaultThemeForcer } from "@/ui/DefaultThemeForcer";
import { UIProvider } from "@/ui/UIContext";
import { assertOrgMember } from "@/utils/auth";
import { getUserMenuContext } from "@/utils/userMenuContext";

import { OrgAdminSideMenu } from "./OrgAdminSideMenu";

const OrgAdminLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) => {
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

  const { orgSlug } = await params;
  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) notFound();

  await assertOrgMember(org.id);

  const userMenu = await getUserMenuContext({ session, currentOrgId: org.id });
  const isDev = config.env === "dev";
  const useStripe = isDev ? (await cookies()).get("dev-use-stripe")?.value === "1" : false;
  const selfHost = await isSelfHost();
  const licensed = selfHost ? (await getLicenseStatus()).valid : false;

  return (
    <UIProvider value="Default">
      <DefaultThemeForcer />
      <SidebarProvider>
        <OrgAdminSideMenu
          orgName={org.name}
          orgSlug={orgSlug}
          userMenu={userMenu}
          isDev={isDev}
          useStripe={useStripe}
          selfHost={selfHost}
          licensed={licensed}
        />
        <SidebarInset id="content" className="max-h-svh overflow-x-hidden overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4 md:hidden">
            <span className="truncate text-sm font-semibold">{org.name}</span>
            <SidebarTrigger className="ml-auto" />
          </header>
          <div className="px-6 py-8 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UIProvider>
  );
};

export default OrgAdminLayout;
