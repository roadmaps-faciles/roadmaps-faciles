import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { espaceMembreClient, verifyEmLinkToken } from "@/lib/gouv/espaceMembre";
import { userRepo } from "@/lib/repo";
import { PrismaClientKnownRequestError } from "@/prisma/internal/prismaNamespace";
import { UpdateUser } from "@/useCases/users/UpdateUser";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";

export const GET = async (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token manquant." }, { status: StatusCodes.BAD_REQUEST });
  }

  const reqCtx = await getRequestContext();

  try {
    const payload = verifyEmLinkToken(token);
    const member = await espaceMembreClient.member.getByUsername(payload.emUsername);

    if (!member.isActive) {
      audit(
        {
          action: AuditAction.EM_LINK_CONFIRM,
          success: false,
          error: "emMemberNotActive",
          userId: payload.userId,
          metadata: { username: payload.emUsername },
        },
        reqCtx,
      );
      return NextResponse.json(
        { error: "Ce membre n'est plus actif sur l'Espace Membre." },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    // Vérifier si ce username est déjà lié à un autre utilisateur
    const existingUser = await userRepo.findByUsername(member.username);
    if (existingUser && existingUser.id !== payload.userId) {
      audit(
        {
          action: AuditAction.EM_LINK_CONFIRM,
          success: false,
          error: "emUsernameAlreadyLinked",
          userId: payload.userId,
          metadata: { username: member.username },
        },
        reqCtx,
      );
      return NextResponse.json(
        { error: "Ce login Espace Membre est déjà lié à un autre compte." },
        { status: StatusCodes.CONFLICT },
      );
    }

    const useCase = new UpdateUser(userRepo);
    await useCase.execute({
      id: payload.userId,
      data: {
        isBetaGouvMember: true,
        username: member.username,
        name: member.fullname,
        image: member.avatar,
      },
    });

    audit(
      {
        action: AuditAction.EM_LINK_CONFIRM,
        userId: payload.userId,
        targetType: "User",
        targetId: payload.userId,
        metadata: { username: member.username },
      },
      reqCtx,
    );
    return NextResponse.redirect(payload.redirectUrl);
  } catch (error) {
    audit(
      {
        action: AuditAction.EM_LINK_CONFIRM,
        success: false,
        error: (error as Error).message,
      },
      reqCtx,
    );
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ce login Espace Membre est déjà lié à un autre compte." },
        { status: StatusCodes.CONFLICT },
      );
    }
    return NextResponse.json({ error: (error as Error).message }, { status: StatusCodes.BAD_REQUEST });
  }
};
