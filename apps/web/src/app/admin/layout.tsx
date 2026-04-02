import { SidebarInset, SidebarProvider, SidebarTrigger } from "@roadmaps-faciles/ui";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { config } from "@/config";
import { auth } from "@/lib/next-auth/auth";
import { DefaultThemeForcer } from "@/ui/DefaultThemeForcer";
import { UIProvider } from "@/ui/UIContext";
import { assertAdmin } from "@/utils/auth";
import { getUserMenuContext } from "@/utils/userMenuContext";

import { AdminSideMenu } from "./AdminSideMenu";

const AdminLayout = async ({ children }: LayoutProps<"/admin">) => {
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

  await assertAdmin();

  const userMenu = await getUserMenuContext({ session });
  const isDev = config.env === "dev";
  const useStripe = isDev ? (await cookies()).get("dev-use-stripe")?.value === "1" : false;

  return (
    <UIProvider value="Default">
      <DefaultThemeForcer />
      <SidebarProvider>
        <AdminSideMenu userMenu={userMenu} isDev={isDev} useStripe={useStripe} />
        <SidebarInset id="content" className="max-h-svh overflow-x-hidden overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4 md:hidden">
            <span className="truncate text-sm font-semibold">Administration</span>
            <SidebarTrigger className="ml-auto" />
          </header>
          <div className="px-6 py-8 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UIProvider>
  );
};

export default AdminLayout;
