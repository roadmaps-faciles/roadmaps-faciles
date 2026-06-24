import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { tenantRepo } from "@/lib/repo";
import { GetTenantForDomain, GetTenantForDomainNotFoundError } from "@/useCases/tenant/GetTenantForDomain";
import { resolveCanonicalTargetHost } from "@/utils/canonicalRedirect";

/**
 * Resolution du redirect canonique pour le proxy (Edge, sans acces Prisma/cache). Le proxy nous
 * passe le host du subdomain tenant ; on resout le tenant (cache 1h via GetTenantForDomain) puis ses
 * settings, et on renvoie l'hote cible vers lequel rediriger, ou null. Route interne : ne fait
 * qu'exposer une info deja publique (la cible du redirect), donc pas d'auth.
 */
export async function GET(request: Request) {
  const host = new URL(request.url).searchParams.get("host");
  if (!host) {
    return Response.json({ target: null });
  }

  const useCase = new GetTenantForDomain(tenantRepo);
  try {
    const tenant = await useCase.execute({ domain: host });
    const settings = await prisma.tenantSettings.findFirst({
      where: { tenantId: tenant.id },
      select: { customDomain: true, forceCustomDomainRedirect: true },
    });
    if (!settings) {
      return Response.json({ target: null });
    }
    const target = resolveCanonicalTargetHost(settings, host, config.rootDomain);
    return Response.json({ target });
  } catch (error) {
    if (error instanceof GetTenantForDomainNotFoundError) {
      return Response.json({ target: null });
    }
    throw error;
  }
}
