SELECT
  p.id,
  p."boardId",
  p.id AS "postId",
  (
    (
      (
        (
          (
            SELECT
              count(*) AS count
            FROM
              "Like" l
            WHERE
              (l."postId" = p.id)
          )
        ) :: numeric * 1.5
      ) + (
        (
          SELECT
            count(*) AS count
          FROM
            "Comment" c
          WHERE
            (c."postId" = p.id)
        )
      ) :: numeric
    ) / power(
      (
        (
          EXTRACT(
            epoch
            FROM
              (
                NOW() - (p."createdAt") :: timestamp WITH time zone
              )
          ) / (3600) :: numeric
        ) + (2) :: numeric
      ),
      1.5
    )
  ) AS hotness
FROM
  "Post" p;