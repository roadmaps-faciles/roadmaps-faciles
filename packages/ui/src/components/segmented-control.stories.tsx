import { BarChart3, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { type Meta, type StoryObj } from "storybook";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "Bascule exclusive entre options dans un conteneur bordé. L'item actif reçoit le fond primaire. Supporte icones et texte.",
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState("account");

    return (
      <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="account">Account</SegmentedControlItem>
        <SegmentedControlItem value="password">Password</SegmentedControlItem>
        <SegmentedControlItem value="notifications">Notifications</SegmentedControlItem>
      </SegmentedControl>
    );
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: "Les items peuvent inclure des icones à coté du texte pour un contexte visuel supplémentaire.",
      },
    },
  },
  render: function WithIconsStory() {
    const [value, setValue] = useState("grid");

    return (
      <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="grid">
          <LayoutGrid /> Grid
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <List /> List
        </SegmentedControlItem>
        <SegmentedControlItem value="chart">
          <BarChart3 /> Chart
        </SegmentedControlItem>
      </SegmentedControl>
    );
  },
};

export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: "Items icone seule pour les layouts compacts. Ajouter un `aria-label` pour l'accessibilité.",
      },
    },
  },
  render: function IconOnlyStory() {
    const [value, setValue] = useState("grid");

    return (
      <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="grid" aria-label="Grid view">
          <LayoutGrid />
        </SegmentedControlItem>
        <SegmentedControlItem value="list" aria-label="List view">
          <List />
        </SegmentedControlItem>
        <SegmentedControlItem value="chart" aria-label="Chart view">
          <BarChart3 />
        </SegmentedControlItem>
      </SegmentedControl>
    );
  },
};

export const WithDisabled: Story = {
  render: function WithDisabledStory() {
    const [value, setValue] = useState("active");

    return (
      <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="active">Active</SegmentedControlItem>
        <SegmentedControlItem value="disabled" disabled>
          Disabled
        </SegmentedControlItem>
        <SegmentedControlItem value="another">Another</SegmentedControlItem>
      </SegmentedControl>
    );
  },
};
