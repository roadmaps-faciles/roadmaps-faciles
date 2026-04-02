import { type Meta, type StoryObj } from "storybook";

import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: {
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Pastille de statut inline avec plusieurs variantes de couleur. Supporte `asChild` pour la composition d'éléments personnalisés.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Success: Story = {
  args: { variant: "success" },
};

export const Warning: Story = {
  args: { variant: "warning" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const AsChild: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilise le `Slot` Radix pour fusionner les styles du badge sur un élément enfant (ici une ancre), permettant un rendu polymorphe.",
      },
    },
  },
  render: () => (
    <Badge asChild>
      <a href="#">Link Badge</a>
    </Badge>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};
