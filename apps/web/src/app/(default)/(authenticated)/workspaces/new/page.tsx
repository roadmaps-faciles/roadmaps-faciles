import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/next-auth/auth";
import { orgMemberRepo } from "@/lib/repo";

import { NewTenantForm } from "./NewTenantForm";

const NewWorkspacePage = async () => {
  const [t, session] = await Promise.all([getTranslations("tenant"), auth()]);

  const adminOrgs = session?.user?.uuid
    ? (await orgMemberRepo.findByUserId(session.user.uuid))
        .filter(m => m.role === "ADMIN" || m.role === "OWNER")
        .map(m => ({ id: m.organizationId, name: m.organization.name, slug: m.organization.slug }))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t("newTitle")}</h1>
      <p className="mb-6 text-muted-foreground">{t("newDescription")}</p>
      <NewTenantForm adminOrgs={adminOrgs} />
    </div>
  );
};

export default NewWorkspacePage;
