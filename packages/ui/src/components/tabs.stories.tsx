import { type Meta, type StoryObj } from "storybook";

import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Interface à onglets avec orientation horizontale ou verticale. Trois variantes : default (pastille sur l'actif), line (indicateur souligné) et segmented (controle contenu).",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Make changes to your account here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="tab-name">Name</Label>
              <Input id="tab-name" defaultValue="Pedro Duarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification preferences content.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Utilise `variant="line"` sur `TabsList` pour un fond transparent avec un indicateur souligné sur l\'onglet actif.',
      },
    },
  },
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList variant="line">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-muted-foreground text-sm">Overview content.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-muted-foreground text-sm">Analytics content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-muted-foreground text-sm">Reports content.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Passe en layout `orientation="vertical"` avec les onglets empilés à gauche et le contenu à droite.',
      },
    },
  },
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-muted-foreground text-sm">General settings content.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-muted-foreground text-sm">Security settings content.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification settings content.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const VerticalLine: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Combine l'orientation verticale avec la variante line, affichant une barre d'indicateur actif sur le coté gauche.",
      },
    },
  },
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="w-[400px]">
      <TabsList variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-muted-foreground text-sm">General settings content.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-muted-foreground text-sm">Security settings content.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification settings content.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Active</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-muted-foreground text-sm">Active tab content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-muted-foreground text-sm">Another tab content.</p>
      </TabsContent>
    </Tabs>
  ),
};
