import { type Meta, type StoryObj } from "storybook";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: "Bloc placeholder pulsant pour les états de chargement. Forme et taille contrôlées via className.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-[250px]",
  },
};

export const Circle: Story = {
  args: {
    className: "size-12 rounded-full",
  },
};

export const Card: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compose plusieurs skeletons (cercle + lignes de texte) pour prévisualiser un layout typique de carte ou de profil utilisateur.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const TextBlock: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  ),
};

export const FormSkeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simule un état de chargement de formulaire avec des skeletons label + input et un placeholder de bouton de soumission.",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-9 w-[120px]" />
    </div>
  ),
};
