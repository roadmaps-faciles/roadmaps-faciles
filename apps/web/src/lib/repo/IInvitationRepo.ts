import { type Invitation, type Prisma } from "@/prisma/client";

export interface IInvitationRepo {
  create(data: Prisma.InvitationUncheckedCreateInput): Promise<Invitation>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Invitation[]>;
  findAllForTenant(tenantId: number): Promise<Invitation[]>;
  findByEmailAndTenant(email: string, tenantId: number): Promise<Invitation | null>;
  findById(id: number): Promise<Invitation | null>;
}
