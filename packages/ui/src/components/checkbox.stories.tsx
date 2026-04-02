import { type Meta, type StoryObj } from "storybook";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: "Case à cocher accessible avec indicateur visuel. Basée sur Radix, supporte l'état indéterminé.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithLabelDisabled: Story = {
  render: () => (
    <div className="group flex items-center gap-2" data-disabled="true">
      <Checkbox id="terms-disabled" disabled />
      <Label htmlFor="terms-disabled">Accept terms and conditions</Label>
    </div>
  ),
};
