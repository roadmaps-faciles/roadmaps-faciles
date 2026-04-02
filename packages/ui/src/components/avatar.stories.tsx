import { Check } from "lucide-react";
import { type Meta, type StoryObj } from "storybook";

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "./avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Avatar utilisateur avec image, initiales en fallback, badge de statut optionnel et empilement en groupe. Disponible en tailles sm, default et lg.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="Broken" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const SizeDefault: Story = {
  render: () => (
    <Avatar size="default">
      <AvatarFallback>MD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeSmall: Story = {
  render: () => (
    <Avatar size="sm">
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
  ),
};

export const SizeLarge: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
  ),
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story: "Superpose un petit badge circulaire (ex. icone de validation) en bas à droite de l'avatar.",
      },
    },
  },
  render: () => (
    <Avatar size="lg">
      <AvatarFallback>AB</AvatarFallback>
      <AvatarBadge>
        <Check />
      </AvatarBadge>
    </Avatar>
  ),
};

export const Group: Story = {
  parameters: {
    docs: {
      description: {
        story: "Empile plusieurs avatars avec un espacement négatif et un indicateur de compteur pour le surplus.",
      },
    },
  },
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
