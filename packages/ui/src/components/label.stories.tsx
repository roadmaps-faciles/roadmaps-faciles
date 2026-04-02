import { type Meta, type StoryObj } from "storybook";

import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Label",
  component: Label,
  args: {
    children: "Label text",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Label de formulaire accessible basé sur Radix. S'atténue automatiquement quand le champ associé est désactivé.",
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="agree" />
      <Label htmlFor="agree">I agree to the terms</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="group grid w-full max-w-sm gap-1.5" data-disabled="true">
      <Label htmlFor="disabled">Disabled Label</Label>
      <Input id="disabled" disabled placeholder="Disabled" />
    </div>
  ),
};
