-- hotness
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
        EXTRACT(
            EPOCH
            FROM now() - p."createdAt"
        ) / 3600 + 2,
        1.5
    ) AS hotness
FROM "Post" p;