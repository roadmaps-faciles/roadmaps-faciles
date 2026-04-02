CREATE TYPE "ActivityType" AS ENUM ('COMMENT', 'FOLLOW', 'STATUS_CHANGE', 'LIKE');
CREATE VIEW "public"."Activity" AS WITH ordered AS (
    SELECT *,
        LAG(type) OVER (
            PARTITION BY "postId"
            ORDER BY "createdAt"
        ) AS prev_type,
        CASE
            WHEN type IN ('LIKE', 'FOLLOW')
            AND (
                LAG(type) OVER (
                    PARTITION BY "postId"
                    ORDER BY "createdAt"
                ) != type
                OR LAG(type) OVER (
                    PARTITION BY "postId"
                    ORDER BY "createdAt"
                ) IS NULL
            ) THEN 1
            ELSE 0
        END AS new_group_flag
    FROM (
            -- Commentaires
            SELECT 'COMMENT'::"ActivityType" AS type,
                c."postId" AS "postId",
                c."createdAt" AS "createdAt",
                c.id AS "commentId",
                NULL::integer AS "statusChangeId"
            FROM "Comment" c
            WHERE c."parentId" IS NULL
            UNION ALL
            -- Changement de statut
            SELECT 'STATUS_CHANGE'::"ActivityType" AS type,
                s."postId" AS "postId",
                s."createdAt" AS "createdAt",
                NULL::integer AS "commentId",
                s.id AS "statusChangeId"
            FROM "PostStatusChange" s
            UNION ALL
            -- Follows
            SELECT 'FOLLOW'::"ActivityType" AS type,
                f."postId" AS "postId",
                f."createdAt" AS "createdAt",
                NULL::integer AS "commentId",
                NULL::integer AS "statusChangeId"
            FROM "Follow" f
            UNION ALL
            -- Likes
            SELECT 'LIKE'::"ActivityType" AS type,
                l."postId" AS "postId",
                l."createdAt" AS "createdAt",
                NULL::integer AS "commentId",
                NULL::integer AS "statusChangeId"
            FROM "Like" l
        ) AS base
),
grouped AS (
    SELECT *,
        SUM(new_group_flag) OVER (
            PARTITION BY "postId"
            ORDER BY "createdAt" ROWS UNBOUNDED PRECEDING
        ) AS group_id
    FROM ordered
),
aggregated AS (
    SELECT "postId",
        type,
        COUNT(*)::integer AS count,
        MIN("createdAt") AS "startTime",
        MAX("createdAt") AS "endTime",
        NULL::integer AS "commentId",
        NULL::integer AS "statusChangeId"
    FROM grouped
    WHERE type IN ('LIKE', 'FOLLOW')
    GROUP BY "postId",
        type,
        group_id
),
non_aggregated AS (
    SELECT "postId",
        type,
        1::integer AS count,
        "createdAt" AS "startTime",
        "createdAt" AS "endTime",
        "commentId",
        "statusChangeId"
    FROM ordered
    WHERE type NOT IN ('LIKE', 'FOLLOW')
)
SELECT (
        row_number() OVER (
            ORDER BY "startTime"
        )
    )::integer AS id,
    *
FROM (
        SELECT *
        FROM aggregated
        UNION ALL
        SELECT *
        FROM non_aggregated
    ) AS final
ORDER BY "startTime";
