import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { config } from "@/config";
import { verifyDomainTxt } from "@/lib/ee/domain-verification";
import { logger } from "@/lib/logger";
import { orgDomainRepo, organizationRepo } from "@/lib/repo";
import { OrgPlan } from "@/prisma/enums";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = config.domainVerification.cronSecret;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const unverifiedDomains = await orgDomainRepo.findUnverified();

  const report = {
    processed: 0,
    verified: 0,
    failed: 0,
    errors: [] as Array<{ domain: string; error: string }>,
  };

  for (const domain of unverifiedDomains) {
    report.processed++;
    try {
      let isVerified: boolean;

      if (config.domainVerification.bypass) {
        isVerified = true;
      } else {
        isVerified = await verifyDomainTxt(domain.domain, domain.verificationToken);
      }

      if (isVerified) {
        await orgDomainRepo.verify(domain.id);
        report.verified++;

        // Auto-upgrade to GOV if .gouv.fr
        if (domain.isGouv) {
          const org = await organizationRepo.findById(domain.organizationId);
          if (org && org.plan !== OrgPlan.GOV) {
            await organizationRepo.update(org.id, { plan: OrgPlan.GOV });
            logger.info({ orgId: org.id, domain: domain.domain }, "Auto-upgraded org to GOV plan");
          }
        }

        logger.info({ domainId: domain.id, domain: domain.domain }, "Domain verified via cron");
      } else {
        report.failed++;
      }
    } catch (error) {
      report.failed++;
      report.errors.push({ domain: domain.domain, error: (error as Error).message });
      logger.warn({ err: error, domainId: domain.id }, "Domain verification cron failed");
    }
  }

  logger.info(report, "Domain verification cron completed");
  return NextResponse.json(report);
}
