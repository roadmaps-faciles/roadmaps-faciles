import { type Meta, type StoryObj } from "storybook";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Sections de contenu dépliables basées sur Radix. Supporte l'ouverture simple ou multiple, avec des transitions animées d'ouverture/fermeture.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styles that match the design system.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It uses CSS animations for smooth open/close transitions.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story: "Permet d'ouvrir plusieurs items simultanément (pas de fermeture automatique).",
      },
    },
  },
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First item</AccordionTrigger>
        <AccordionContent>Content for the first item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second item</AccordionTrigger>
        <AccordionContent>Content for the second item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third item</AccordionTrigger>
        <AccordionContent>Content for the third item.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>This item is open by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>This item is closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Enabled item</AccordionTrigger>
        <AccordionContent>This item can be toggled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Disabled item</AccordionTrigger>
        <AccordionContent>This item cannot be toggled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
