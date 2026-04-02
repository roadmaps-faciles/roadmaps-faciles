WITH ordered AS (
  SELECT
    base.type,
    base."postId",
    base."createdAt",
    base."commentId",
    base."statusChangeId",
    lag(base.type) OVER (
      PARTITION BY base."postId"
      ORDER BY
        base."createdAt"
    ) AS prev_type,
    CASE
      WHEN (
        (
          base.type = ANY (
            ARRAY ['LIKE'::"ActivityType", 'FOLLOW'::"ActivityType"]
          )
        )
        AND (
          (
            lag(base.type) OVER (
              PARTITION BY base."postId"
              ORDER BY
                base."createdAt"
            ) <> base.type
          )
          OR (
            lag(base.type) OVER (
              PARTITION BY base."postId"
              ORDER BY
                base."createdAt"
            ) IS NULL
          )
        )
      ) THEN 1
      ELSE 0
    END AS new_group_flag
  FROM
    (
      SELECT
        'COMMENT' :: "ActivityType" AS TYPE,
        c."postId",
        c."createdAt",
        c.id AS "commentId",
        NULL :: integer AS "statusChangeId"
      FROM
        "Comment" c
      WHERE
        (c."parentId" IS NULL)
      UNION
      ALL
      SELECT
        'STATUS_CHANGE' :: "ActivityType" AS TYPE,
        s."postId",
        s."createdAt",
        NULL :: integer AS "commentId",
        s.id AS "statusChangeId"
      FROM
        "PostStatusChange" s
      UNION
      ALL
      SELECT
        'FOLLOW' :: "ActivityType" AS TYPE,
        f."postId",
        f."createdAt",
        NULL :: integer AS "commentId",
        NULL :: integer AS "statusChangeId"
      FROM
        "Follow" f
      UNION
      ALL
      SELECT
        'LIKE' :: "ActivityType" AS TYPE,
        l."postId",
        l."createdAt",
        NULL :: integer AS "commentId",
        NULL :: integer AS "statusChangeId"
      FROM
        "Like" l
    ) base
),
grouped AS (
  SELECT
    ordered.type,
    ordered."postId",
    ordered."createdAt",
    ordered."commentId",
    ordered."statusChangeId",
    ordered.prev_type,
    ordered.new_group_flag,
    sum(ordered.new_group_flag) OVER (
      PARTITION BY ordered."postId"
      ORDER BY
        ordered."createdAt" ROWS UNBOUNDED PRECEDING
    ) AS group_id
  FROM
    ordered
),
aggregated AS (
  SELECT
    grouped."postId",
    grouped.type,
    (count(*)) :: integer AS count,
    min(grouped."createdAt") AS "startTime",
    max(grouped."createdAt") AS "endTime",
    NULL :: integer AS "commentId",
    NULL :: integer AS "statusChangeId"
  FROM
    grouped
  WHERE
    (
      grouped.type = ANY (
        ARRAY ['LIKE'::"ActivityType", 'FOLLOW'::"ActivityType"]
      )
    )
  GROUP BY
    grouped."postId",
    grouped.type,
    grouped.group_id
),
non_aggregated AS (
  SELECT
    ordered."postId",
    ordered.type,
    1 AS count,
    ordered."createdAt" AS "startTime",
    ordered."createdAt" AS "endTime",
    ordered."commentId",
    ordered."statusChangeId"
  FROM
    ordered
  WHERE
    (
      ordered.type <> ALL (
        ARRAY ['LIKE'::"ActivityType", 'FOLLOW'::"ActivityType"]
      )
    )
)
SELECT
  (
    row_number() OVER (
      ORDER BY
        final."startTime"
    )
  ) :: integer AS id,
  final."postId",
  final.type,
  final.count,
  final."startTime",
  final."endTime",
  final."commentId",
  final."statusChangeId"
FROM
  (
    SELECT
      aggregated."postId",
      aggregated.type,
      aggregated.count,
      aggregated."startTime",
      aggregated."endTime",
      aggregated."commentId",
      aggregated."statusChangeId"
    FROM
      aggregated
    UNION
    ALL
    SELECT
      non_aggregated."postId",
      non_aggregated.type,
      non_aggregated.count,
      non_aggregated."startTime",
      non_aggregated."endTime",
      non_aggregated."commentId",
      non_aggregated."statusChangeId"
    FROM
      non_aggregated
  ) final
ORDER BY
  final."startTime";