import { MailIcon, SearchIcon } from "lucide-react";
import { type Meta, type StoryObj } from "storybook";

import { Hint } from "./hint";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    placeholder: "Type something...",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Champ de saisie stylisé avec support de l'upload de fichiers, anneau de focus, état de validation et gestion du mode sombre.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const WithHint: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="project">Nom du projet</Label>
      <Input id="project" defaultValue="Roadmap Q4" />
      <Hint>Ce champ a le focus actif.</Hint>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email-icon">Email</Label>
      <div className="relative">
        <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id="email-icon" placeholder="user@exemple.com" className="pl-9" />
      </div>
      <Hint>Champ avec icône descriptive.</Hint>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="password-err">Mot de passe</Label>
      <Input id="password-err" type="password" defaultValue="badpassword" aria-invalid />
      <Hint variant="error">Format d'email invalide</Hint>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="deadline">Date limite</Label>
      <Input id="deadline" disabled defaultValue="31/12/2023" />
      <Hint>Modification non autorisée.</Hint>
    </div>
  ),
};

export const Search: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="search">Recherche</Label>
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id="search" type="search" placeholder="Rechercher..." className="pl-9" />
      </div>
    </div>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: "Default value",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const File: Story = {
  args: {
    type: "file",
  },
};

/** Composition complète : label + input avec icône + select + textarea + hints. Reproduit le pattern Stitch. */
export const FormFields: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="ff-name">Nom du projet (Focus)</Label>
        <Input id="ff-name" defaultValue="Roadmap Q4" />
        <Hint>Ce champ a le focus actif.</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-email">Email (Icône)</Label>
        <div className="relative">
          <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input id="ff-email" placeholder="user@exemple.com" className="pl-9" />
        </div>
        <Hint>Champ avec icône descriptive.</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-pass">Mot de passe (Erreur)</Label>
        <Input id="ff-pass" type="password" defaultValue="badpassword" aria-invalid />
        <Hint variant="error">Format d'email invalide</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-date">Date limite (Désactivé)</Label>
        <Input id="ff-date" disabled defaultValue="31/12/2023" />
        <Hint>Modification non autorisée.</Hint>
      </div>
    </div>
  ),
};
