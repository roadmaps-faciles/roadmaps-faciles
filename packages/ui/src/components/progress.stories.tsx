import { type Meta, type StoryObj } from "storybook";

import { Progress } from "./progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: {
    value: 50,
    className: "w-[60%]",
  },
  parameters: {
    docs: {
      description: {
        component: "Barre de progression horizontale avec remplissage animé piloté par la prop `value` (0--100).",
      },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const Quarter: Story = {
  args: { value: 25 },
};

export const Half: Story = {
  args: { value: 50 },
};

export const ThreeQuarters: Story = {
  args: { value: 75 },
};

export const Full: Story = {
  args: { value: 100 },
};

export const AllValues: Story = {
  render: () => (
    <div className="flex w-[60%] flex-col gap-4">
      <Progress value={0} />
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  ),
};
