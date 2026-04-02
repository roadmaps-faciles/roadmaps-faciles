import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";

import { DomainPageHOP } from "../../../DomainPage";
import { ModerationPostList } from "../ModerationPostList";

const RejectedPostsPage = DomainPageHOP()(async ({ _data }) => {
  const t = await getTranslations("moderation");

  const posts = await prisma.post.findMany({
    where: {
      tenantId: _data.tenant.id,
      approvalStatus: POST_APPROVAL_STATUS.REJECTED,
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
      <h1 className="text-xl font-bold">{t("rejectedTitle")}</h1>
      <ModerationPostList posts={posts} emptyMessage={t("noRejectedPosts")} variant="rejected" />
    </>
  );
});

export default RejectedPostsPage;
