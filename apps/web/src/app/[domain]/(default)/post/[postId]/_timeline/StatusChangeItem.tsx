import {
  Badge as ShadcnBadge,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineSeparator,
} from "@roadmaps-faciles/ui";
import { Table } from "lucide-react";

import { type StatusChangeActivity } from "./activityHelpers";
import { ItemDate } from "./ItemDate";

export const StatusChangeItem = ({ activity }: { activity: StatusChangeActivity }) => {
  return (
    <>
      <TimelineSeparator>
        <TimelineDot variant="outline" size="icon">
          <Table className="size-4" />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className="flex flex-col">
        <ItemDate activity={activity} />
        <span>
          <b>Le post est passé en statut</b> :{" "}
          <ShadcnBadge variant="outline">{activity.statusChange.postStatus.name}</ShadcnBadge>
        </span>
      </TimelineContent>
    </>
  );
};
