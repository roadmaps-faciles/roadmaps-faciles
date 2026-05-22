import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { DomainPageHOP } from "@/lib/DomainPage";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { boardRepo } from "@/lib/repo";
import { ListBoardsForTenant } from "@/useCases/boards/ListBoardsForTenant";

import { RoadmapForm } from "./RoadmapForm";
import { RoadmapPostsList } from "./RoadmapPostsList";

const RoadmapAdminPage = DomainPageHOP()(async props => {
  const { tenant, settings } = props._data;

  const useCase = new ListBoardsForTenant(boardRepo);
  const [boards, posts, t] = await Promise.all([
    useCase.execute({ tenantId: tenant.id }),
    prisma.post.findMany({
      where: {
        tenantId: tenant.id,
        approvalStatus: POST_APPROVAL_STATUS.APPROVED,
        postStatusId: { not: null },
        postStatus: { showInRoadmap: true },
      },
      orderBy: [{ postStatus: { order: "asc" } }, { likes: { _count: "desc" } }],
      include: {
        postStatus: true,
        board: { select: { id: true, name: true } },
      },
    }),
    getTranslations("domainAdmin.roadmap"),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <RoadmapForm boards={boards} currentRootBoardId={settings.rootBoardId} />
      <RoadmapPostsList
        posts={posts.map(p => ({
          id: p.id,
          title: p.title,
          progress: p.progress,
          eta: p.eta,
          boardName: p.board.name,
          statusName: p.postStatus?.name ?? null,
          statusColor: p.postStatus?.color ?? null,
        }))}
      />
    </>
  );
});

export default RoadmapAdminPage;
