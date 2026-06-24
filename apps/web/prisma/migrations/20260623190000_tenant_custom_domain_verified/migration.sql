-- Un customDomain de tenant n'est de confiance pour l'auth qu'une fois vérifié (couvert par un
-- OrgDomain vérifié de l'organisation du tenant). Les customDomains existants sont grandfathered
-- en vérifiés pour ne pas casser les tenants déjà en prod.
ALTER TABLE "TenantSettings" ADD COLUMN "customDomainVerifiedAt" TIMESTAMP(3);

UPDATE "TenantSettings" SET "customDomainVerifiedAt" = CURRENT_TIMESTAMP WHERE "customDomain" IS NOT NULL;
