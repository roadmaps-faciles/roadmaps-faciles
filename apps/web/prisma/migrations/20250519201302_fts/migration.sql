-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "textsearchable_index_col" tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'french'::regconfig,
            COALESCE(title, ''::text) || ' ' || COALESCE(description, ''::text)
        )
    ) STORED;
-- CreateIndex
CREATE INDEX "Post_textsearchable_index_col_idx" ON "Post" USING GIN ("textsearchable_index_col");