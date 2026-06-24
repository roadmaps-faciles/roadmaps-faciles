-- Token TXT pour prouver la propriété d'un customDomain de tenant (vérif self-service via DNS TXT).
ALTER TABLE "TenantSettings" ADD COLUMN "customDomainVerificationToken" TEXT;
