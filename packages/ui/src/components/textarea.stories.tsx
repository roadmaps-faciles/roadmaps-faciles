import { type Meta, type StoryObj } from "storybook";

import { Hint } from "./hint";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    placeholder: "Type your message here...",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Zone de texte auto-dimensionnante via `field-sizing: content`. Hauteur minimum 64px, avec support de la validation et du mode sombre.",
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="message">Votre message</Label>
      <Textarea id="message" placeholder="Écrivez votre message ici." />
      <Hint>Maximum 500 caractères.</Hint>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled textarea",
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: "This is some default text content that was pre-filled.",
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="bio">Biographie</Label>
      <Textarea id="bio" defaultValue="x" aria-invalid />
      <Hint variant="error">Le texte doit contenir au moins 10 caractères.</Hint>
    </div>
  ),
};
