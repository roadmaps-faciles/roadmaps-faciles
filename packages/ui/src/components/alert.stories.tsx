import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { type Meta, type StoryObj } from "storybook";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          "Bandeau d'alerte contextuel avec code couleur par variante (default, destructive, success, warning).",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>This is a default alert with an informational message.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <CheckCircle2 className="size-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <TriangleAlert className="size-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>This action cannot be undone.</AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert>
      <AlertTitle>No Icon</AlertTitle>
      <AlertDescription>This alert has no icon.</AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>Title only alert</AlertTitle>
    </Alert>
  ),
};
