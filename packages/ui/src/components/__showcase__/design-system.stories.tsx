import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleDotIcon,
  HomeIcon,
  InfoIcon,
  MailIcon,
  MessageSquareIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { type Meta, type StoryObj } from "storybook";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../accordion";
import { Alert, AlertDescription, AlertTitle } from "../alert";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Badge } from "../badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../breadcrumb";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Checkbox } from "../checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Hint } from "../hint";
import { Input } from "../input";
import { Label } from "../label";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Progress } from "../progress";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { SegmentedControl, SegmentedControlItem } from "../segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Separator } from "../separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../sheet";
import { Skeleton } from "../skeleton";
import { Switch } from "../switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Textarea } from "../textarea";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "../timeline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-foreground border-border border-b pb-2 text-xl font-semibold">{title}</h2>
    {children}
  </div>
);

const Row = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
);

const meta = {
  title: "Design System/Showcase",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Vue d'ensemble de tous les composants du design system @roadmaps-faciles/ui. 31 composants, tokens French Blue (oklch), light + dark.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  render: function Showcase() {
    const [switchOn, setSwitchOn] = useState(false);
    const [progress] = useState(65);

    return (
      <TooltipProvider>
        <div className="bg-background text-foreground space-y-10 p-8">
          <div>
            <h1 className="text-2xl font-bold">@roadmaps-faciles/ui - Design System</h1>
            <p className="text-muted-foreground">31 composants · French Blue · oklch tokens · light + dark</p>
          </div>

          {/* ---- Buttons ---- */}
          <Section title="Button">
            <Row>
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <PlusIcon />
              </Button>
            </Row>
          </Section>

          {/* ---- Badge ---- */}
          <Section title="Badge">
            <Row>
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="link">Link</Badge>
            </Row>
          </Section>

          {/* ---- Alert ---- */}
          <Section title="Alert">
            <Alert>
              <InfoIcon />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>Notification neutre avec contexte.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>Une erreur est survenue.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <CheckIcon />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>Opération réussie.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <CircleAlertIcon />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>Action requise.</AlertDescription>
            </Alert>
          </Section>

          {/* ---- Avatar ---- */}
          <Section title="Avatar">
            <Row>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>ML</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
            </Row>
          </Section>

          {/* ---- Card ---- */}
          <Section title="Card">
            <div className="grid max-w-2xl grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Titre carte</CardTitle>
                  <CardDescription>Description courte</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Contenu de la carte avec des informations.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2,847</div>
                  <p className="text-muted-foreground text-xs">+12% ce mois</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ---- Input / Textarea / Label / Hint ---- */}
          <Section title="Input, Textarea, Label, Hint">
            <div className="max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-input">Email</Label>
                <Input id="email-input" type="email" placeholder="jean@example.com" />
                <Hint variant="description">Votre adresse email professionnelle.</Hint>
              </div>
              <div className="space-y-2">
                <Label htmlFor="error-input">Champ en erreur</Label>
                <Input id="error-input" defaultValue="invalide" aria-invalid />
                <Hint variant="error">Ce champ est requis.</Hint>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textarea-demo">Message</Label>
                <Textarea id="textarea-demo" placeholder="Décrivez votre idée..." />
              </div>
            </div>
          </Section>

          {/* ---- Checkbox / Radio / Switch ---- */}
          <Section title="Checkbox, Radio, Switch">
            <div className="space-y-4">
              <Row>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-1" defaultChecked />
                  <Label htmlFor="check-1">Accepté</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-2" />
                  <Label htmlFor="check-2">Non coché</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check-3" disabled />
                  <Label htmlFor="check-3">Désactivé</Label>
                </div>
              </Row>
              <RadioGroup defaultValue="option-1">
                <Row>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-1" id="radio-1" />
                    <Label htmlFor="radio-1">Option 1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-2" id="radio-2" />
                    <Label htmlFor="radio-2">Option 2</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-3" id="radio-3" />
                    <Label htmlFor="radio-3">Option 3</Label>
                  </div>
                </Row>
              </RadioGroup>
              <Row>
                <div className="flex items-center gap-2">
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} id="switch-demo" />
                  <Label htmlFor="switch-demo">{switchOn ? "Activé" : "Désactivé"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch size="sm" defaultChecked id="switch-sm" />
                  <Label htmlFor="switch-sm">Small</Label>
                </div>
              </Row>
            </div>
          </Section>

          {/* ---- Select ---- */}
          <Section title="Select">
            <div className="max-w-xs">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          {/* ---- Segmented Control ---- */}
          <Section title="Segmented Control">
            <SegmentedControl defaultValue="list">
              <SegmentedControlItem value="list">Liste</SegmentedControlItem>
              <SegmentedControlItem value="cards">Cartes</SegmentedControlItem>
              <SegmentedControlItem value="kanban">Kanban</SegmentedControlItem>
            </SegmentedControl>
          </Section>

          {/* ---- Tabs ---- */}
          <Section title="Tabs">
            <Tabs defaultValue="overview" className="max-w-md">
              <TabsList>
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="analytics">Analytique</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm">
                Contenu vue d'ensemble.
              </TabsContent>
              <TabsContent value="analytics" className="text-sm">
                Contenu analytique.
              </TabsContent>
              <TabsContent value="settings" className="text-sm">
                Contenu paramètres.
              </TabsContent>
            </Tabs>
          </Section>

          {/* ---- Accordion ---- */}
          <Section title="Accordion">
            <Accordion type="single" collapsible className="max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment soumettre une idée ?</AccordionTrigger>
                <AccordionContent>Cliquez sur le bouton "Nouvelle idée" et remplissez le formulaire.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Qui peut voter ?</AccordionTrigger>
                <AccordionContent>Tous les utilisateurs connectés peuvent voter sur les idées.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Comment suivre ma suggestion ?</AccordionTrigger>
                <AccordionContent>
                  Abonnez-vous aux notifications du post pour être alerté des changements.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ---- Table ---- */}
          <Section title="Table">
            <div className="max-w-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Jean Dupont</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>
                      <Badge variant="success">Actif</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Marie Martin</TableCell>
                    <TableCell>Modérateur</TableCell>
                    <TableCell>
                      <Badge variant="success">Actif</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Paul Leroy</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Inactif</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Section>

          {/* ---- Breadcrumb ---- */}
          <Section title="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Paramètres</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Section>

          {/* ---- Navigation Menu ---- */}
          <Section title="Navigation Menu">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <HomeIcon className="mr-2 size-4" />
                    Accueil
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <SettingsIcon className="mr-2 size-4" />
                    Paramètres
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <UserIcon className="mr-2 size-4" />
                    Profil
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Section>

          {/* ---- Pagination ---- */}
          <Section title="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Section>

          {/* ---- Progress ---- */}
          <Section title="Progress">
            <div className="max-w-md space-y-3">
              <Progress value={progress} />
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Progression</span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
            </div>
          </Section>

          {/* ---- Separator ---- */}
          <Section title="Separator">
            <div className="max-w-md">
              <div className="text-sm">Contenu au dessus</div>
              <Separator className="my-3" />
              <div className="text-sm">Contenu en dessous</div>
            </div>
            <Row>
              <span className="text-sm">Gauche</span>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm">Droite</span>
            </Row>
          </Section>

          {/* ---- Skeleton ---- */}
          <Section title="Skeleton">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Section>

          {/* ---- Dialog ---- */}
          <Section title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Ouvrir le dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer l'action</DialogTitle>
                  <DialogDescription>Êtes-vous sûr de vouloir continuer ?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Annuler</Button>
                  <Button>Confirmer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          {/* ---- Sheet ---- */}
          <Section title="Sheet">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Ouvrir le panneau</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Panneau latéral</SheetTitle>
                  <SheetDescription>Contenu du panneau glissant.</SheetDescription>
                </SheetHeader>
                <div className="p-4">
                  <p className="text-sm">Contenu du sheet ici.</p>
                </div>
              </SheetContent>
            </Sheet>
          </Section>

          {/* ---- Dropdown Menu ---- */}
          <Section title="Dropdown Menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Menu <ChevronRightIcon className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 size-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 size-4" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MailIcon className="mr-2 size-4" /> Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Section>

          {/* ---- Popover ---- */}
          <Section title="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <BellIcon className="mr-2 size-4" /> Notifications
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notifications récentes</p>
                  <Separator />
                  <p className="text-muted-foreground text-sm">Aucune nouvelle notification.</p>
                </div>
              </PopoverContent>
            </Popover>
          </Section>

          {/* ---- Tooltip ---- */}
          <Section title="Tooltip">
            <Row>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SunIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mode clair</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoonIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mode sombre</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SearchIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rechercher</TooltipContent>
              </Tooltip>
            </Row>
          </Section>

          {/* ---- Timeline ---- */}
          <Section title="Timeline">
            <Timeline className="max-w-lg">
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot variant="success" size="icon">
                    <CheckIcon className="size-4 text-white" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Déployé</p>
                    <Badge variant="success">Terminé</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">Il y a 2 heures</p>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot variant="default" size="icon">
                    <MessageSquareIcon className="size-4 text-white" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <p className="text-sm font-medium">Commentaire ajouté</p>
                  <p className="text-muted-foreground text-xs">Il y a 5 heures</p>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot variant="muted" size="icon">
                    <StarIcon className="text-muted-foreground size-4" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <p className="text-muted-foreground text-sm">3 votes</p>
                  <p className="text-muted-foreground text-xs">Hier</p>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot variant="outline" size="icon">
                    <CircleDotIcon className="text-primary size-4" />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <p className="text-sm font-medium">Post créé</p>
                  <p className="text-muted-foreground text-xs">Il y a 3 jours</p>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Section>
        </div>
      </TooltipProvider>
    );
  },
};
