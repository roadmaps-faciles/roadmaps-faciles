# @roadmaps-faciles/ui

Bibliothèque de composants UI partagés, basée sur [shadcn/ui](https://ui.shadcn.com/) et [Radix UI](https://www.radix-ui.com/).

## Stack

- **Radix UI** (primitives accessibles)
- **Tailwind CSS 4** (styling via CSS custom properties)
- **class-variance-authority** (variants)
- **tailwind-merge + clsx** (composition de classes via `cn()`)
- **Lucide React** (icônes)

## Structure

```
src/
  components/     # 27 composants shadcn (accordion, button, dialog, etc.)
    index.ts      # barrel - re-exporte tous les composants
  lib/
    cn.ts         # utilitaire cn() (clsx + twMerge)
    use-mobile.ts # hook useIsMobile() (breakpoint 768px)
  tokens/
    theme.css     # design tokens CSS (palette French Blue, light + dark)
  index.ts        # entry point principal
```

## Composants

| Composant | Exports principaux |
|-----------|-------------------|
| accordion | `Accordion`, `AccordionItem`, `AccordionContent`, `AccordionTrigger` |
| alert | `Alert`, `AlertTitle`, `AlertDescription` |
| avatar | `Avatar`, `AvatarImage`, `AvatarFallback` |
| badge | `Badge`, `badgeVariants` |
| breadcrumb | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` |
| button | `Button`, `buttonVariants` |
| card | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` |
| checkbox | `Checkbox` |
| dialog | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| dropdown-menu | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSub` |
| input | `Input` |
| label | `Label` |
| navigation-menu | `NavigationMenu`, `NavigationMenuItem`, `NavigationMenuLink`, `NavigationMenuList`, `NavigationMenuTrigger`, `NavigationMenuContent`, `navigationMenuTriggerStyle` |
| pagination | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` |
| popover | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` |
| progress | `Progress` |
| radio-group | `RadioGroup`, `RadioGroupItem` |
| select | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` |
| separator | `Separator` |
| sheet | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` |
| sidebar | `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `useSidebar` |
| skeleton | `Skeleton` |
| switch | `Switch` |
| table | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableFooter` |
| tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| textarea | `Textarea` |
| tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |

## Imports

```tsx
// Barrel (tous les composants)
import { Button, Card, Dialog } from "@roadmaps-faciles/ui";

// Import direct (tree-shaking optimal)
import { Button } from "@roadmaps-faciles/ui/components/button";

// Utilitaire cn()
import { cn } from "@roadmaps-faciles/ui/lib/cn";

// Design tokens CSS
import "@roadmaps-faciles/ui/tokens/theme.css";
```

## Design tokens

Les tokens CSS sont scopés à `[data-ui-theme="Default"]` avec support dark mode (`.dark[data-ui-theme="Default"]`).

Palette **French Blue** (`#163C90`) en oklch :
- Primary, secondary, accent, muted, destructive, success, warning
- Surface, surface-alt, card, popover
- Sidebar (background, primary, accent, border)
- Charts (5 couleurs)

## ESLint

Pas de `eslint.config.ts` local - hérite naturellement de la config racine du monorepo.

```bash
pnpm lint       # lint via config racine
pnpm lint --fix # auto-fix (prettier, import sorting)
```
