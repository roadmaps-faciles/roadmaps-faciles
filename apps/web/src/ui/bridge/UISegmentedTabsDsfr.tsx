import {
  SegmentedControl as DsfrSegmentedControl,
  type SegmentedControlProps as DsfrSegmentedControlProps,
} from "@codegouvfr/react-dsfr/SegmentedControl";

import { type UISegmentedTabsProps } from "./UISegmentedTabs";

export const UISegmentedTabsDsfr = ({
  segments,
  value,
  onValueChange,
  name,
  legend,
  className,
}: UISegmentedTabsProps) => {
  if (segments.length === 0 || segments.length > 5) {
    return null;
  }

  const dsfrSegments = segments.map(seg => ({
    label: seg.label,
    nativeInputProps: {
      name,
      value: seg.value,
      checked: value === seg.value,
      onChange: () => onValueChange(seg.value),
    },
  })) as unknown as DsfrSegmentedControlProps["segments"];

  return <DsfrSegmentedControl legend={legend} hideLegend segments={dsfrSegments} className={className} />;
};
