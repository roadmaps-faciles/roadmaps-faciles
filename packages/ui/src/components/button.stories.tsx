import { ChevronRight, Loader2, Mail } from "lucide-react";
import { type Meta, type StoryObj } from "storybook";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Bouton polymorphe avec 6 variantes de style, 8 options de taille (dont icone seule) et support `asChild` pour la composition d'éléments personnalisés.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Default: Story = {};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Link: Story = {
  args: { variant: "link" },
};

// Sizes
export const SizeDefault: Story = {
  args: { size: "default" },
};

export const SizeXs: Story = {
  args: { size: "xs", children: "Extra Small" },
};

export const SizeSm: Story = {
  args: { size: "sm", children: "Small" },
};

export const SizeLg: Story = {
  args: { size: "lg", children: "Large" },
};

export const SizeIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Bouton carré dimensionné pour ne contenir qu'une icone (36x36px). Nécessite un `aria-label` pour l'accessibilité.",
      },
    },
  },
  args: {
    size: "icon",
    children: <Mail />,
    "aria-label": "Send email",
  },
};

export const SizeIconXs: Story = {
  args: {
    size: "icon-xs",
    children: <Mail />,
    "aria-label": "Send email",
  },
};

export const SizeIconSm: Story = {
  args: {
    size: "icon-sm",
    children: <Mail />,
    "aria-label": "Send email",
  },
};

export const SizeIconLg: Story = {
  args: {
    size: "icon-lg",
    children: <Mail />,
    "aria-label": "Send email",
  },
};

// States
export const Disabled: Story = {
  args: { disabled: true },
};

// With icon
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>
        <Mail /> Login with Email
      </Button>
      <Button variant="destructive">
        <Mail /> Delete
      </Button>
      <Button variant="outline">
        <Mail /> Outline
      </Button>
      <Button variant="secondary">
        <Mail /> Secondary
      </Button>
      <Button variant="ghost">
        <Mail /> Ghost
      </Button>
    </div>
  ),
};

export const IconRight: Story = {
  parameters: {
    docs: {
      description: {
        story: "Icone placée après le label, couramment utilisée pour les patterns de navigation suivant/avant.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>
        Next <ChevronRight />
      </Button>
      <Button variant="outline">
        Continue <ChevronRight />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: "Combine l'état `disabled` avec une icone en rotation pour indiquer une action en cours.",
      },
    },
  },
  render: () => (
    <Button disabled>
      <Loader2 className="animate-spin" />
      Please wait
    </Button>
  ),
};

// AsChild
export const AsChild: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilise le `Slot` Radix pour rendre une balise ancre avec le style complet du bouton, permettant les patterns lien-en-tant-que-bouton.",
      },
    },
  },
  render: () => (
    <Button asChild>
      <a href="#">Link as Button</a>
    </Button>
  ),
};

// All variants gallery
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Mail />
      </Button>
      <Button size="icon-xs">
        <Mail />
      </Button>
      <Button size="icon-sm">
        <Mail />
      </Button>
      <Button size="icon-lg">
        <Mail />
      </Button>
    </div>
  ),
};
