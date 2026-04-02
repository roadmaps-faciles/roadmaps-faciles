import { CheckIcon, CircleAlertIcon, CircleDotIcon, MessageSquareIcon, StarIcon, ThumbsUpIcon } from "lucide-react";
import { type Meta, type StoryObj } from "storybook";

import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineSubConnector,
  TimelineSubItem,
} from "./timeline";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  parameters: {
    docs: {
      description: {
        component:
          "Timeline verticale pour afficher une séquence d'événements. Compound component : `Timeline` > `TimelineItem` > `TimelineSeparator` (dot + connecteur) + `TimelineContent`.",
      },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Idée soumise</p>
          <p className="text-muted-foreground text-xs">Il y a 3 jours</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">En cours d'étude</p>
          <p className="text-muted-foreground text-xs">Il y a 2 jours</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Planifié</p>
          <p className="text-muted-foreground text-xs">Aujourd'hui</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Story interactive — utilise les controls Storybook pour configurer les props des sous-composants (dot variant/size, connector variant, sub-connector indent).",
      },
    },
  },
  argTypes: {
    // @ts-expect-error -- Custom args, not real Timeline props
    dotVariant: {
      control: "select",
      options: ["default", "outline", "success", "warning", "destructive", "muted"],
      description: "TimelineDot variant",
      table: { category: "TimelineDot" },
    },
    dotSize: {
      control: "select",
      options: ["sm", "default", "lg", "icon"],
      description: "TimelineDot size",
      table: { category: "TimelineDot" },
    },
    connectorVariant: {
      control: "select",
      options: ["connected", "spaced"],
      description: "TimelineConnector variant",
      table: { category: "TimelineConnector" },
    },
    subIndent: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "TimelineSubConnector indent",
      table: { category: "TimelineSubConnector" },
    },
  },
  args: {
    // @ts-expect-error -- Custom args
    dotVariant: "default",
    dotSize: "icon",
    connectorVariant: "connected",
    subIndent: "default",
  },
  render: args => {
    const { dotVariant, dotSize, connectorVariant, subIndent } = args as unknown as {
      dotVariant: "default" | "destructive" | "muted" | "outline" | "success" | "warning";
      dotSize: "default" | "icon" | "lg" | "sm";
      connectorVariant: "connected" | "spaced";
      subIndent: "default" | "lg" | "sm";
    };
    return (
      <Timeline className="max-w-xl">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <MessageSquareIcon className="size-4" />}
            </TimelineDot>
            <TimelineConnector variant={connectorVariant} />
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 10 minutes</p>
            <Card className="mt-1.5">
              <CardContent className="p-4">
                <p className="text-sm font-medium">Commentaire principal</p>
                <p className="mt-1 text-sm">Avec du contenu détaillé et des réponses.</p>
              </CardContent>
            </Card>
            <TimelineSubConnector indent={subIndent}>
              <TimelineSubItem>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">Première réponse</p>
                    <p className="mt-1 text-sm">Bonne idée !</p>
                  </CardContent>
                </Card>
              </TimelineSubItem>
              <TimelineSubItem>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">Deuxième réponse</p>
                    <p className="mt-1 text-sm">Merci, noté pour la v2.</p>
                  </CardContent>
                </Card>
              </TimelineSubItem>
            </TimelineSubConnector>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <CheckIcon className="size-4" />}
            </TimelineDot>
            <TimelineConnector variant={connectorVariant} />
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 2 heures</p>
            <p className="text-sm font-medium">Événement simple</p>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <StarIcon className="size-4" />}
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 3 jours</p>
            <p className="text-sm font-medium">Dernier événement</p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );
  },
};

export const WithVariants: Story = {
  name: "Dot Variants",
  render: () => (
    <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Terminé</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="warning" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">En attente</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="destructive" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Rejeté</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Brouillon</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="muted" />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Archivé</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" size="icon">
            <CheckIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Déployé en production</p>
          <p className="text-muted-foreground text-xs">Il y a 1 heure</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="default" size="icon">
            <MessageSquareIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Nouveau commentaire</p>
          <p className="text-muted-foreground text-xs">Il y a 3 heures</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="warning" size="icon">
            <CircleAlertIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Signalé pour modération</p>
          <p className="text-muted-foreground text-xs">Hier</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" size="icon">
            <CircleDotIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Idée soumise</p>
          <p className="text-muted-foreground text-xs">Il y a 3 jours</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const PostActivity: Story = {
  name: "Post Activity (Real-World)",
  parameters: {
    docs: {
      description: {
        story:
          "Exemple réaliste simulant l'historique d'activité d'un post : commentaires avec replies, changements de statut avec badge, votes agrégés, et création du post.",
      },
    },
  },
  render: () => (
    <Timeline className="max-w-xl">
      {/* Comment with reply thread — sub-connector for nesting */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="default" size="icon">
            <MessageSquareIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 10 minutes</p>
          <Card className="mt-1.5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback>LS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Lilian Saget-Lethias</span>
                <Badge variant="destructive" className="text-[10px]">
                  Propriétaire
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Auteur
                </Badge>
              </div>
              <p className="mt-2 text-sm">Commentaire principal avec du contenu détaillé.</p>
              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                <span>04/03/2026 20:33</span>
                <span>2 réponse(s)</span>
              </div>
            </CardContent>
          </Card>
          {/* Replies with sub-connector — L-hook on last item */}
          <TimelineSubConnector>
            <TimelineSubItem>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">ML</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Marie Leroy</span>
                  </div>
                  <p className="mt-1.5 text-sm">Bonne idée ! +1 pour le filtre par date.</p>
                </CardContent>
              </Card>
            </TimelineSubItem>
            <TimelineSubItem>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">LS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Lilian Saget-Lethias</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Auteur
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm">Merci, je note ça pour la v2 !</p>
                </CardContent>
              </Card>
            </TimelineSubItem>
          </TimelineSubConnector>
        </TimelineContent>
      </TimelineItem>

      {/* Status change */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" size="icon">
            <CheckIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 2 heures</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Statut changé</p>
            <Badge variant="success">Terminé</Badge>
          </div>
          <p className="text-muted-foreground text-xs">par Admin</p>
        </TimelineContent>
      </TimelineItem>

      {/* Aggregate votes */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="muted" size="icon">
            <ThumbsUpIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 1 jour</p>
          <p className="text-sm">
            <span className="font-semibold">3</span> personnes ont voté
          </p>
        </TimelineContent>
      </TimelineItem>

      {/* Post created */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" size="icon">
            <StarIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 3 jours</p>
          <p className="text-sm font-medium">Jean a créé le post</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Sizes: Story = {
  name: "Dot Sizes",
  render: () => (
    <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Small (8px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="default" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Default (12px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Large (16px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="icon">
            <StarIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Icon (32px)</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Compact: Story = {
  name: "Compact (Small Dots)",
  parameters: {
    docs: {
      description: {
        story: "Version compacte avec des petits dots, idéale pour les changelog ou les logs simples.",
      },
    },
  },
  render: () => (
    <Timeline className="max-w-sm">
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">v2.4.0 déployé</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">Fix pagination board</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">Migration Prisma 7</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" variant="muted" />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-muted-foreground text-xs">3 commits précédents...</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};
