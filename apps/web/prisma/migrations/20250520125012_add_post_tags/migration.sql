-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "Post_tags_idx" ON "Post"("tags");
