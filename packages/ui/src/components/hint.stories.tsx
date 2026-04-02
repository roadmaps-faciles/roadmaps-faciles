import { type Meta, type StoryObj } from "storybook";

import { Hint } from "./hint";

const meta = {
  title: "Components/Hint",
  component: Hint,
  parameters: {
    docs: {
      description: {
        component:
          "Texte d'aide sous les champs de formulaire. Deux variantes : description (gris) et erreur (rouge avec icône).",
      },
    },
  },
} satisfies Meta<typeof Hint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Description: Story = {
  args: {
    children: "Ce champ est obligatoire.",
    variant: "description",
  },
};

export const Error: Story = {
  args: {
    children: "Format d'email invalide",
    variant: "error",
  },
};
