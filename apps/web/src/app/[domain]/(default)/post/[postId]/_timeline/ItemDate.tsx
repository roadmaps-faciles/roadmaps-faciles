"use client";

import { useLocale } from "next-intl";

import { type Activity } from "@/prisma/client";
import { UITooltip } from "@/ui/bridge";
import { formatDateHour, formatRelativeDate } from "@/utils/date";

export const ItemDate = ({ activity }: { activity: Pick<Activity, "startTime"> }) => {
  const locale = useLocale();

  return (
    <span className="text-xs font-light text-nowrap">
      <UITooltip title={formatDateHour(activity.startTime, locale)}>
        {formatRelativeDate(activity.startTime, locale)}
      </UITooltip>
    </span>
  );
};
