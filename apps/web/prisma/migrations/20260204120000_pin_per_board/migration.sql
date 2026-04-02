-- CreateSequence
CREATE SEQUENCE pin_id_seq;

-- AlterTable
ALTER TABLE "Pin" ADD COLUMN     "boardId" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" SET DEFAULT nextval('pin_id_seq');
ALTER SEQUENCE pin_id_seq OWNED BY "Pin"."id";

-- Backfill boardId from Post.boardId for any existing pin rows
UPDATE "Pin" SET "boardId" = (SELECT "boardId" FROM "Post" WHERE "Post"."id" = "Pin"."postId");

-- Remove the temporary default
ALTER TABLE "Pin" ALTER COLUMN "boardId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Pin_boardId_postId_key" ON "Pin"("boardId", "postId");

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
