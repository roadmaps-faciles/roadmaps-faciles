BEGIN;
-- 1) Ajouter les nouvelles colonnes sur TenantSetting en NULLABLE pour permettre le backfill
ALTER TABLE "TenantSetting"
ADD COLUMN "customDomain" TEXT,
    ADD COLUMN "locale" "Locale",
    ADD COLUMN "name" TEXT,
    ADD COLUMN "subdomain" TEXT;
-- 2) Backfill depuis Tenant -> TenantSetting
--    On copie par jointure sur la relation 1–1 (ts.tenantId -> t.id)
UPDATE "TenantSetting" AS ts
SET "customDomain" = t."customDomain",
    "locale" = COALESCE(t."locale", 'fr'::"Locale"),
    "name" = t."name",
    "subdomain" = t."subdomain"
FROM "Tenant" AS t
WHERE ts."tenantId" = t."id";
-- 3) Sécuriser la locale (au cas où) et vérifier que les champs requis sont bien renseignés
UPDATE "TenantSetting"
SET "locale" = 'fr'::"Locale"
WHERE "locale" IS NULL;
-- (facultatif mais utile) : échouer tôt si le backfill n'a pas tout rempli
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM "TenantSetting"
    WHERE "name" IS NULL
        OR "subdomain" IS NULL
) THEN RAISE EXCEPTION 'Backfill incomplet : des TenantSetting n''ont pas name/subdomain';
END IF;
END $$;
-- 4) Poser les contraintes NOT NULL et le DEFAULT
ALTER TABLE "TenantSetting"
ALTER COLUMN "locale"
SET DEFAULT 'fr'::"Locale",
    ALTER COLUMN "locale"
SET NOT NULL,
    ALTER COLUMN "name"
SET NOT NULL,
    ALTER COLUMN "subdomain"
SET NOT NULL;
-- 5) Créer les index uniques APRES le backfill
--    (Postgres autorise plusieurs NULLs pour customDomain, donc OK)
CREATE UNIQUE INDEX IF NOT EXISTS "TenantSetting_customDomain_key" ON "TenantSetting" ("customDomain");
CREATE UNIQUE INDEX IF NOT EXISTS "TenantSetting_subdomain_key" ON "TenantSetting" ("subdomain");
-- 6) Supprimer les anciennes colonnes de style/branding de TenantSetting
ALTER TABLE "TenantSetting" DROP COLUMN IF EXISTS "customCSS",
    DROP COLUMN IF EXISTS "logoHeight",
    DROP COLUMN IF EXISTS "logoLink",
    DROP COLUMN IF EXISTS "logoUrl",
    DROP COLUMN IF EXISTS "logoWidth";
-- 7) Supprimer les index uniques de Tenant (devenus obsolètes)
DROP INDEX IF EXISTS "public"."Tenant_customDomain_key";
DROP INDEX IF EXISTS "public"."Tenant_subdomain_key";
-- 8) Enfin, supprimer les colonnes migrées depuis Tenant
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "customDomain",
    DROP COLUMN IF EXISTS "locale",
    DROP COLUMN IF EXISTS "name",
    DROP COLUMN IF EXISTS "subdomain";
COMMIT;