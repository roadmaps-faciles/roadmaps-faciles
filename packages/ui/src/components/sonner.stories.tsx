import { type Meta, type StoryObj } from "storybook";

import { Button } from "./button";
import { toast, Toaster } from "./sonner";

const meta = {
  title: "Components/Sonner",
  component: Toaster,
  decorators: [
    Story => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Système de notifications toast propulsé par Sonner. Placer `<Toaster />` une fois dans le layout, puis appeler `toast()` pour déclencher les notifications.",
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast("Event has been created.")}>
      Show Toast
    </Button>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" })}
    >
      With Description
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.success("Changes saved successfully.")}>
      Success
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error("Something went wrong.", { description: "Please try again." })}
    >
      Error
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning("This action is irreversible.")}>
      Warning
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info("A new version is available.")}>
      Info
    </Button>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ajoute un bouton d'action inline au toast pour une interaction rapide (ex. annuler, réessayer).",
      },
    },
  },
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("File deleted", {
          action: {
            label: "Undo",
            onClick: () => toast("File restored"),
          },
        })
      }
    >
      With Action
    </Button>
  ),
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affiche un spinner de chargement qui peut être mis à jour en succès/erreur via l'ID du toast retourné.",
      },
    },
  },
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const id = toast.loading("Saving changes...");
        setTimeout(() => toast.success("Done!", { id }), 2000);
      }}
    >
      Loading → Success
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Default toast")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Success toast")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Error toast")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Warning toast")}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("Info toast")}>
        Info
      </Button>
    </div>
  ),
};
