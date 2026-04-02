BEGIN;
-- 1) La colonne FTS passe de "GENERATED ALWAYS" à une colonne classique
ALTER TABLE public."Post"
ALTER COLUMN "textsearchable_index_col" DROP EXPRESSION;
-- 2) Backfill des données existantes
UPDATE public."Post"
SET "textsearchable_index_col" = to_tsvector(
        'french'::regconfig,
        COALESCE(title, '') || ' ' || COALESCE(description, '')
    );
-- 3) Fonction de trigger (remplaçable)
CREATE OR REPLACE FUNCTION public.post_fts_trigger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.textsearchable_index_col := to_tsvector(
        'french'::regconfig,
        COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '')
    );
RETURN NEW;
END $$;
-- 4) Trigger (on remplace proprement s’il existe déjà)
DROP TRIGGER IF EXISTS post_fts_update ON public."Post";
CREATE TRIGGER post_fts_update BEFORE
INSERT
    OR
UPDATE ON public."Post" FOR EACH ROW EXECUTE FUNCTION public.post_fts_trigger();
COMMIT;
