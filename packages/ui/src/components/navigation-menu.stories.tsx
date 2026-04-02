import { type Meta, type StoryObj } from "storybook";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Barre de navigation horizontale avec panneaux déroulants animés. Supporte le mode viewport, le mode inline et une flèche indicatrice animée.",
      },
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink href="#">
                  <div className="text-lg font-medium">shadcn/ui</div>
                  <p className="text-muted-foreground text-sm leading-tight">
                    Beautifully designed components built with Radix UI and Tailwind CSS.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Introduction</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Re-usable components built using Radix UI and Tailwind CSS.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Installation</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    How to install dependencies and structure your app.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Alert Dialog</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    A modal dialog that interrupts the user.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Hover Card</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    For sighted users to preview content.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithoutViewport: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Désactive le conteneur viewport flottant via `viewport={false}`, affichant le contenu déroulant inline sous le déclencheur.",
      },
    },
  },
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-2 p-2">
              <li>
                <NavigationMenuLink href="#">Item One</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Item Two</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SimpleLinks: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Liens de navigation simples sans déroulant, utilisant `navigationMenuTriggerStyle()` pour une apparence cohérente des déclencheurs.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithIndicator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Ajoute un indicateur fléché animé sous le déclencheur actif qui glisse entre les items du menu au survol.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink href="#">
                  <div className="text-lg font-medium">shadcn/ui</div>
                  <p className="text-muted-foreground text-sm leading-tight">
                    Beautifully designed components built with Radix UI and Tailwind CSS.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Introduction</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Re-usable components built using Radix UI and Tailwind CSS.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Installation</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    How to install dependencies and structure your app.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Alert Dialog</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    A modal dialog that interrupts the user.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium leading-none">Hover Card</div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    For sighted users to preview content.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
