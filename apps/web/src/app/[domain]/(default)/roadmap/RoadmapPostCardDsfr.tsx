"use client";

import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useFormatter, useTranslations } from "next-intl";

import { LikeButton } from "@/components/Board/LikeButton";
import { getTone, TONE_TO_DSFR_SEVERITY } from "@/lib/utils/postStatusTone";

import { type RoadmapPostCardProps } from "./RoadmapPostCard";
import styles from "./RoadmapPostCardDsfr.module.scss";

export const RoadmapPostCardDsfr = ({ post, showVotes, tenantId, userId, dense }: RoadmapPostCardProps) => {
  const t = useTranslations("roadmap.card");
  const format = useFormatter();
  const tone = getTone(post.statusColor);
  const severity = TONE_TO_DSFR_SEVERITY[tone];
  const visibleTags = post.tags.slice(0, 3);
  const statusLabel = post.statusName ?? post.boardName;

  const start = (
    <>
      <div className={styles.statusRow}>
        <Badge severity={severity ?? undefined} small noIcon={severity === null}>
          {statusLabel}
        </Badge>
      </div>
      <ul className={cx("fr-tags-group", styles.tagsRow)}>
        {visibleTags.map(tag => (
          <li key={tag}>
            <Tag small>{tag}</Tag>
          </li>
        ))}
        {visibleTags.length === 0 && (
          <li>
            <Tag small>{post.boardName}</Tag>
          </li>
        )}
      </ul>
    </>
  );

  const end = (
    <>
      {post.progress != null && (
        <div className={styles.progress} aria-label={t("progressLabel")}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={post.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressFill} style={{ width: `${post.progress}%` }} />
          </div>
          <span className={styles.progressValue}>{post.progress}%</span>
        </div>
      )}
      <ul className="fr-tags-group">
        {post.shippedAt && (
          <li>
            <Tag small iconId="fr-icon-check-line">
              {t("shipped", { date: format.dateTime(post.shippedAt, { month: "long", year: "numeric" }) })}
            </Tag>
          </li>
        )}
        {!post.shippedAt && post.eta && (
          <li>
            <Tag small iconId="fr-icon-time-line">
              {t("eta", { eta: post.eta })}
            </Tag>
          </li>
        )}
        {post.commentsCount > 0 && (
          <li>
            <Tag small iconId="fr-icon-chat-3-line">
              {String(post.commentsCount)}
            </Tag>
          </li>
        )}
      </ul>
    </>
  );

  return (
    <div className={styles.cardWrap}>
      <Card
        size="small"
        border
        background
        shadow={false}
        titleAs="h3"
        title={post.title}
        linkProps={{ href: post.postUrl }}
        desc={!dense && post.description ? post.description : undefined}
        start={start}
        end={end}
        classes={{ desc: styles.desc }}
      />
      {showVotes && (
        <div className={styles.voteSlot}>
          <LikeButton postId={post.id} tenantId={tenantId} size="sm" userId={userId} alreadyLiked={post.alreadyLiked}>
            {post.likesCount}
          </LikeButton>
        </div>
      )}
    </div>
  );
};
