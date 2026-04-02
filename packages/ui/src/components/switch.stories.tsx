import { type Meta, type StoryObj } from "storybook";

import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Interrupteur à bascule accessible avec transition fluide du curseur. Supporte les variantes de taille default et sm.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

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

export const SizeDefault: Story = {
  args: {
    size: "default",
  },
};

export const SizeSmall: Story = {
  args: {
    size: "sm",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch id="sm" size="sm" defaultChecked />
        <Label htmlFor="sm">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="default" size="default" defaultChecked />
        <Label htmlFor="default">Default</Label>
      </div>
    </div>
  ),
};
