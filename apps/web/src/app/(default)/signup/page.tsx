import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { config } from "@/config";
import { auth } from "@/lib/next-auth/auth";

import { SignupForm } from "./SignupForm";

const SignupPage = async (_: PageProps<"/signup">) => {
  const session = await auth();
  if (session) redirect("/workspaces");

  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {t("signupTitle", { brandName: config.brand.name })}
        </h2>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
