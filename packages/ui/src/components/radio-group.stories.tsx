import { type Meta, type StoryObj } from "storybook";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Groupe de boutons radio accessible basé sur Radix. Affiche un indicateur circulaire plein sur l'item sélectionné.",
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-three" id="option-three" />
        <Label htmlFor="option-three">Option Three</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="d-option-one" />
        <Label htmlFor="d-option-one">Option One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="d-option-two" />
        <Label htmlFor="d-option-two">Option Two</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story: "Remplace la grille verticale par défaut par `flex-row` pour des options radio horizontales inline.",
      },
    },
  },
  render: () => (
    <RadioGroup defaultValue="a" className="flex flex-row gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="h-a" />
        <Label htmlFor="h-a">A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="h-b" />
        <Label htmlFor="h-b">B</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="c" id="h-c" />
        <Label htmlFor="h-c">C</Label>
      </div>
    </RadioGroup>
  ),
};
