import { Button } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { userRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { type NextServerPageProps } from "@/utils/next";

import { UserEditForm } from "./UserEditForm";

const UserEditPage = async ({ params }: NextServerPageProps<{ userId: string }>) => {
  await connection();

  const { userId } = await params;
  const user = await userRepo.findById(userId);
  if (!user) notFound();
  if (user.role === UserRole.OWNER || user.role === UserRole.INHERITED) notFound();

  const t = await getTranslations("rootAdmin");

  return (
    <>
      <AdminPageHeader
        title={user.name ?? user.email}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">{t("back")}</Link>
          </Button>
        }
      />
      <UserEditForm user={user} />
    </>
  );
};

export default UserEditPage;
