import { prisma } from "@/lib/db/prisma";
import { type OrgDomain, type Prisma } from "@/prisma/client";

import { type IOrgDomainRepo } from "../IOrgDomainRepo";

export class OrgDomainRepoPrisma implements IOrgDomainRepo {
  public create(data: Prisma.OrgDomainUncheckedCreateInput): Promise<OrgDomain> {
    return prisma.orgDomain.create({ data });
  }

  public findById(id: number): Promise<null | OrgDomain> {
    return prisma.orgDomain.findUnique({ where: { id } });
  }

  public async delete(id: number): Promise<void> {
    await prisma.orgDomain.delete({ where: { id } });
  }

  public findByDomain(domain: string): Promise<null | OrgDomain> {
    return prisma.orgDomain.findUnique({ where: { domain } });
  }

  public findByOrgId(organizationId: number): Promise<OrgDomain[]> {
    return prisma.orgDomain.findMany({ where: { organizationId } });
  }

  public findByVerificationToken(token: string): Promise<null | OrgDomain> {
    return prisma.orgDomain.findUnique({ where: { verificationToken: token } });
  }

  public findUnverified(): Promise<OrgDomain[]> {
    return prisma.orgDomain.findMany({ where: { verifiedAt: null } });
  }

  public verify(id: number): Promise<OrgDomain> {
    return prisma.orgDomain.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }
}
