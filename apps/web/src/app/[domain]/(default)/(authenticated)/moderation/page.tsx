import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";

import { DomainPageHOP } from "../../DomainPage";
import { ModerationPostList } from "./ModerationPostList";

const ModerationPage = DomainPageHOP()(async ({ _data }) => {
  const t = await getTranslations("moderation");

  const posts = await prisma.post.findMany({
    where: {
      tenantId: _data.tenant.id,
      approvalStatus: POST_APPROVAL_STATUS.PENDING,
    },
    include: {
      user: true,
      board: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <h1 className="text-xl font-bold">{t("pendingTitle")}</h1>
      <ModerationPostList posts={posts} emptyMessage={t("noPendingPosts")} variant="pending" />
    </>
  );
});

export default ModerationPage;
