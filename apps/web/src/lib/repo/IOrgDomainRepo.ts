import { type OrgDomain, type Prisma } from "@/prisma/client";

export interface IOrgDomainRepo {
  create(data: Prisma.OrgDomainUncheckedCreateInput): Promise<OrgDomain>;
  delete(id: number): Promise<void>;
  findByDomain(domain: string): Promise<null | OrgDomain>;
  findById(id: number): Promise<null | OrgDomain>;
  findByOrgId(organizationId: number): Promise<OrgDomain[]>;
  findByVerificationToken(token: string): Promise<null | OrgDomain>;
  findUnverified(): Promise<OrgDomain[]>;
  verify(id: number): Promise<OrgDomain>;
}
