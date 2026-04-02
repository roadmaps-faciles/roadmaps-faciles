import { redirect, RedirectType } from "next/navigation";

import { auth } from "@/lib/next-auth/auth";

const LoginLayout = async ({ children }: LayoutProps<"/login">) => {
  const session = await auth();

  if (session?.user) {
    redirect("/", RedirectType.replace);
  }

  return <>{children}</>;
};

export default LoginLayout;
