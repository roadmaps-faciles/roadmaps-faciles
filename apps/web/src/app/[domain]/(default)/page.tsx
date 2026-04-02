import { notFound } from "next/navigation";

import { auth } from "@/lib/next-auth/auth";
import { boardRepo, postStatusRepo, userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { UIContainer } from "@/ui/bridge";
import { GetBoardSlug, GetBoardSlugNotFoundError } from "@/useCases/boards/GetBoardSlug";

import BoardPage from "./board/[boardSlug]/page";
import { DomainPageHOP } from "./DomainPage";
import RoadmapPage from "./roadmap/page";
import { SeedBanner } from "./SeedBanner";

const DomainRootPage = DomainPageHOP()(async props => {
  const { settings, tenant } = props._data;

  let showSeedBanner = false;
  const boards = await boardRepo.findAllForTenant(tenant.id);
  const statuses = await postStatusRepo.findAllForTenant(tenant.id);
  if (boards.length === 0 && statuses.length === 0) {
    const session = await auth();
    if (session?.user) {
      if (session.user.isSuperAdmin) {
        showSeedBanner = true;
      } else {
        const membership = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);
        showSeedBanner = membership?.role === UserRole.OWNER || membership?.role === UserRole.ADMIN;
      }
    }
  }

  const content = await (async () => {
    if (settings.rootBoardId) {
      const useCase = new GetBoardSlug(boardRepo);
      try {
        const { slug } = await useCase.execute(settings.rootBoardId);
        return BoardPage({
          ...props,
          params: Promise.resolve({
            ...(await props.params),
            boardSlug: slug,
          }),
        });
      } catch (error: unknown) {
        if (error instanceof GetBoardSlugNotFoundError) {
          notFound();
        }
        throw error;
      }
    } else {
      return RoadmapPage({ ...props });
    }
  })();

  return (
    <>
      <UIContainer className="mt-4">{showSeedBanner && <SeedBanner tenantId={tenant.id} />}</UIContainer>
      {content}
    </>
  );
});
export default DomainRootPage;
