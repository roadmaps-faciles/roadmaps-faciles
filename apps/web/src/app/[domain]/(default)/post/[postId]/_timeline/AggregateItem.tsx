import { TimelineConnector, TimelineContent, TimelineDot, TimelineSeparator } from "@roadmaps-faciles/ui";
import { Rss, ThumbsUp } from "lucide-react";

import { type Activity } from "@/prisma/client";

import { type AggregateActivity } from "./activityHelpers";
import { ItemDate } from "./ItemDate";

const ICONS = {
  LIKE: {
    icon: ThumbsUp,
    wordAction: "aimé",
  },
  FOLLOW: {
    icon: Rss,
    wordAction: "suivi",
  },
} satisfies Partial<
  Record<Activity["type"], { icon: React.ComponentType<{ className?: string }>; wordAction: string }>
>;

export const AggregateItem = ({ activity }: { activity: AggregateActivity }) => {
  const IconComponent = ICONS[activity.type].icon;

  return (
    <>
      <TimelineSeparator>
        <TimelineDot variant="outline" size="icon">
          <IconComponent className="size-4" />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className="flex flex-col">
        <ItemDate activity={activity} />
        <span>
          <b>{activity.count}</b> personne{activity.count > 1 ? "s ont" : " a"} {ICONS[activity.type].wordAction} le
          post
        </span>
      </TimelineContent>
    </>
  );
};
