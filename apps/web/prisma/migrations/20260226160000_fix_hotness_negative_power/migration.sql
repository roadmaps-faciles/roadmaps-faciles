-- Fix: POWER() crashes when createdAt is in the future (negative base raised to non-integer power).
-- This can happen when syncing dates from Notion (timezone offsets or future-dated entries).
-- GREATEST(..., 1) ensures the denominator is always >= 1.
CREATE OR REPLACE VIEW "public"."PostWithHotness" AS
SELECT p.id AS id,
    p."boardId" AS "boardId",
    p.id AS "postId",
    (
        (
            SELECT COUNT(*)
            FROM "Like" l
            WHERE l."postId" = p.id
        ) * 1.5 + (
            SELECT COUNT(*)
            FROM "Comment" c
            WHERE c."postId" = p.id
        )
    ) / POWER(
        GREATEST(
            EXTRACT(
                EPOCH
                FROM now() - p."createdAt"
            ) / 3600 + 2,
            1
        ),
        1.5
    ) AS hotness
FROM "Post" p;
