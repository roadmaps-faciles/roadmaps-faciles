# Design System — French Blue (thème "Default")

> **Audience** : développeurs du projet. Ce document est la référence combinée pour le thème shadcn "Default" (French Blue). Pour les décisions individuelles, voir les DDR dans `docs/ddr/`.

---

## Table des matières

1. [Architecture du thème](#architecture-du-thème)
2. [Palette & tokens CSS](#palette--tokens-css)
3. [Tailwind 4 bridge](#tailwind-4-bridge)
4. [Dark mode](#dark-mode)
5. [Composants](#composants)
   - [Button](#button)
   - [Card](#card)
   - [Badge](#badge)
   - [Header](#header)
   - [Footer](#footer)
   - [SkipLinks](#skiplinks)
6. [Typographie](#typographie)
7. [Layout & spacing](#layout--spacing)
8. [Icônes](#icônes)
9. [DSFR — séparation & coexistence](#dsfr--séparation--coexistence)
10. [Fichiers clés](#fichiers-clés)

---

## Architecture du thème

```
                 ┌──────────────────────────────────────┐
                 │          src/app/layout.tsx           │
                 │  data-ui-theme="Default"              │
                 │  class="dark" (via ThemeScript)       │
                 │  <ThemeScript /> dans <head>          │
                 │  <UIProvider value="Default">         │
                 └───────────────┬──────────────────────┘
                                 │
            ┌────────────────────┼────────────────────────┐
            ▼                    ▼                         ▼
   (default) pages       [domain] tenant            doc/ pages
   theme = Default     theme = getTheme(settings)   theme = Default
                        "Default" | "Dsfr"
                              │
               ┌──────────────┼──────────────┐
               ▼                              ▼
        theme === "Dsfr"               theme === "Default"
        DsfrProvider wraps (toujours)  DsfrProvider wraps (toujours)
        ConsentBanner                  Header/Footer shadcn
        Header/Footer DSFR            Pas de ConsentBanner
```

### Fichiers d'infrastructure

| Fichier | Rôle |
|---------|------|
| `apps/web/src/ui/types.ts` | Type `UiTheme = "Default" \| "Dsfr"` |
| `apps/web/src/ui/UIContext.tsx` | `UIProvider` + `useUI()` — React context pour le thème actif |
| `apps/web/src/ui/server.ts` | `getTheme(settings)` — résolution server-side |
| `apps/web/src/ui/ThemeInjector.tsx` | Client component — injecte `data-ui-theme` sur `<html>` au mount |
| `apps/web/src/app/ThemeScript.tsx` | Script inline bloquant — dark mode sans FOUC |
| `apps/web/src/app/globals.scss` | Tokens CSS + Tailwind bridge + DSFR resets |
| `apps/web/src/app/root.module.scss` | Styles `.app` / `.content` conditionnels par thème |

---

## Palette & tokens CSS

Palette **French Blue**, toutes les valeurs en **oklch** (espace perceptuellement uniforme, P3-ready).

### Light mode — `[data-ui-theme="Default"]`

| Token | Valeur | Nom interne | Usage |
|-------|--------|-------------|-------|
| `--primary` | `oklch(0.386 0.146 263)` | French Blue | CTA, accents, éléments interactifs |
| `--primary-foreground` | `oklch(1 0 0)` | White | Texte sur fond primary |
| `--background` | `oklch(1 0 0)` | White | Fond de page |
| `--foreground` | `oklch(0.252 0.041 264)` | Carbon Black (blue tint) | Texte body |
| `--card` | `oklch(1 0 0)` | White | Surface des cartes |
| `--card-foreground` | `oklch(0.252 0.041 264)` | Carbon Black | Texte des cartes |
| `--popover` | `oklch(1 0 0)` | White | Surface popover/dropdown |
| `--popover-foreground` | `oklch(0.252 0.041 264)` | Carbon Black | Texte popover |
| `--secondary` | `oklch(0.853 0.031 265)` | Lavender | Bouton secondaire bg |
| `--secondary-foreground` | `oklch(0.350 0.114 263)` | Regal Navy | Texte bouton secondaire |
| `--muted` | `oklch(0.935 0.015 265)` | Light Lavender | Fills subtils, zones secondaires |
| `--muted-foreground` | `oklch(0.542 0.104 265)` | Smart Blue | Texte secondaire/descriptif |
| `--accent` | `oklch(0.920 0.020 265)` | Wisteria area | Hover states |
| `--accent-foreground` | `oklch(0.350 0.114 263)` | Regal Navy | Texte sur accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red | Actions destructives |
| `--border` | `oklch(0.885 0.020 265)` | Lavender border | Bordures, dividers |
| `--input` | `oklch(0.885 0.020 265)` | = border | Bordure des inputs |
| `--ring` | `oklch(0.542 0.104 265)` | Smart Blue | Focus ring |

### Dark mode — `.dark[data-ui-theme="Default"]`

| Token | Valeur | Delta vs light |
|-------|--------|----------------|
| `--primary` | `oklch(0.620 0.130 264)` | +0.23 L, -0.02 C — bleu plus clair pour contraste |
| `--background` | `oklch(0.220 0.010 264)` | Carbon Black |
| `--foreground` | `oklch(0.920 0.015 265)` | Near Lavender |
| `--card` | `oklch(0.260 0.030 264)` | Prussian Blue |
| `--secondary` | `oklch(0.313 0.079 264)` | Twilight Indigo |
| `--muted` | `oklch(0.313 0.060 264)` | Twilight Indigo |
| `--muted-foreground` | `oklch(0.700 0.066 266)` | Wisteria Blue |
| `--accent` | `oklch(0.340 0.060 264)` | Twilight deeper |
| `--border` | `oklch(0.350 0.050 264)` | Twilight subtle |

### Charts

5 couleurs pour les graphiques, du French Blue vers des accents complémentaires :

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | French Blue | Lighter Blue |
| `--chart-2` | Smart Blue | Wisteria |
| `--chart-3` | Wisteria Blue | Lavender |
| `--chart-4` | Orange accent | Purple accent |
| `--chart-5` | Green accent | Red accent |

### Custom tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| `--sticky-offset` | `3.5rem` | Hauteur du header (h-14), utilisé par les éléments sticky en SCSS |
| `--radius` | `0.625rem` | Border radius global |

---

## Tailwind 4 bridge

Le `@theme inline` dans `globals.scss` mappe les CSS custom properties vers les `--color-*` que Tailwind 4 attend pour générer ses utilitaires :

```scss
@theme inline {
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-background: var(--background);
    // ... etc pour chaque token
    --radius: 0.625rem;
}
```

Ça permet d'écrire `bg-primary`, `text-muted-foreground`, `border-border/40` directement dans le JSX.

**Piège connu** : les custom `--spacing-*` ne sont pas fiablement générés par Turbopack — pour des valeurs dynamiques basées sur des CSS vars (ex: `--sticky-offset`), utiliser des SCSS modules plutôt que des utilitaires Tailwind.

---

## Dark mode

### Mécanisme

1. **`ThemeScript`** (`apps/web/src/app/ThemeScript.tsx`) — script inline bloquant dans `<head>`
   - Lit `localStorage("theme")` (convention standard shadcn/next-themes)
   - Fallback sur `prefers-color-scheme` media query
   - Toggle `classList.toggle("dark", isDark)` sur `<html>`
   - S'exécute **avant le premier paint** → zéro FOUC

2. **Classe** : `.dark` sur `<html>` — convention standard shadcn/next-themes

3. **Sélecteur CSS** : `.dark[data-ui-theme="Default"]` — double sélecteur pour ne matcher que le thème Default en dark

4. **Fallback** : pas de classe `.dark` = light mode par défaut (si JS échoue)

### Comment implémenter un dark mode toggle

```ts
// 1. Écrire la préférence
localStorage.setItem("theme", "dark" | "light");
// 2. Appliquer immédiatement
document.documentElement.classList.toggle("dark", isDark);
```

Sur les pages `/doc`, next-themes (via Fumadocs `RootProvider`) gère le toggle automatiquement via `storageKey: "theme"` et `attribute: "class"`.

---

## Composants

### Button

**Source** : `packages/ui/src/components/button.tsx` — cva avec 6 variants × 8 sizes.

#### Variants

| Variant | Classes | Quand l'utiliser |
|---------|---------|------------------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | CTA principal |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Action alternative |
| `outline` | `border bg-background hover:bg-accent` | Actions inline dans les cartes |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | Navigation, actions tertiaires |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` | Suppression, irréversible |
| `link` | `text-primary underline-offset-4 hover:underline` | Lien stylistiquement |

#### Sizes

| Size | Hauteur | Usage |
|------|---------|-------|
| `xs` | `h-6` | Micro-actions (tags) |
| `sm` | `h-8` | Actions secondaires inline |
| `default` | `h-9` | Standard |
| `lg` | `h-10` | CTA, hero |
| `icon` | `size-9` | Bouton icône seul |
| `icon-xs/sm/lg` | `size-6/8/10` | Variantes icône |

#### Règles strictes

1. **ZÉRO shadow/glow** sur les boutons. Jamais de `shadow-*` ou `shadow-primary/*`.
2. Le hover se fait par changement d'opacité du background uniquement.
3. Sur fond inversé (`bg-primary`), les couleurs s'inversent :

```tsx
{/* Principal sur fond primary */}
<Button className="bg-primary-foreground !text-primary hover:bg-primary-foreground/90 hover:!text-primary">

{/* Secondaire sur fond primary */}
<Button variant="ghost"
  className="border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
```

#### Sizing en contexte

| Contexte | Recette |
|----------|---------|
| Hero CTA | `size="lg"` + `px-8 py-6 text-base` |
| Section CTA (fond primary) | `size="lg"` + `px-10 py-4 text-lg font-bold` |
| Formulaire inline | `size="default"` |
| Compact | `size="sm"` |

> Ref: DDR-0003

---

### Card

**Source** : `packages/ui/src/components/card.tsx` — sub-components : `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`.

**Defaults du composant** : `bg-card text-card-foreground rounded-xl border py-6 shadow-sm`.

#### Hiérarchie de profondeur

| Niveau | Classes à ajouter | Padding | Usage |
|--------|------------------|---------|-------|
| **Outer** | `border-border/40 shadow-none` | `p-8` | Cartes principales (bento, sections) |
| **Inner** | `border-border/30 shadow-none` | `p-4` | Cartes imbriquées (kanban items, formulaires) |
| **Status** | `border-{color}/20 shadow-none` | `p-4` | Cartes avec indicateur sémantique |
| **Accent bg** | `bg-muted/30` | — | Zone secondaire dans une carte outer |

#### Exemples

```tsx
{/* Outer */}
<Card className="border-border/40 p-8 shadow-none md:col-span-8">

{/* Inner */}
<Card className="border-border/30 bg-muted/30 p-4 shadow-none">

{/* Status: en cours */}
<Card className="border-primary/20 bg-primary/[0.02] p-4 shadow-none">

{/* Status: livré (avec dark variants) */}
<Card className="border-emerald-100/50 bg-emerald-50/20 p-4 shadow-none
                 dark:border-emerald-900/50 dark:bg-emerald-950/20">
```

#### Règles

1. **Toujours** `shadow-none` — le composant a `shadow-sm` par défaut.
2. **Jamais** de `shadow-md`/`shadow-lg` sur les cartes.
3. Inner < Outer pour l'opacité des bordures (`/30` < `/40`).
4. Pour les couleurs sémantiques (emerald, amber), prévoir les classes `dark:` explicites.

> Ref: DDR-0004

---

### Badge

**Source** : `packages/ui/src/components/badge.tsx` — cva avec 6 variants.

| Variant | Usage |
|---------|-------|
| `default` | `bg-primary text-primary-foreground` — statut actif, highlight |
| `secondary` | `bg-secondary` — label informatif neutre |
| `outline` | `border-border text-foreground` — tag subtil |
| `destructive` | `bg-destructive text-white` — erreur, alerte |
| `ghost` | Transparent — catégorie légère |
| `link` | `text-primary underline` — lien en badge |

#### Patterns courants

```tsx
{/* Label BETA dans le hero */}
<Badge variant="outline" className="flex gap-2 px-3 py-1">
  <span className="font-bold text-primary">BETA</span>
  <span className="border-l border-border pl-2 text-muted-foreground">Texte</span>
</Badge>

{/* Status kanban */}
<Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700
                  dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
  Priorité
</Badge>

{/* Version footer */}
<Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
  v1.2.3
</Badge>
```

---

### Header

Deux variantes : **RootHeader** (root pages) et **Header** (tenant pages).

#### RootHeader (`apps/web/src/ui/RootHeader.tsx`)

```
┌─────────────────────────────────────────────────────────────┐
│ [Icon + Brand + Badge]    [Nav links]     [Quick access]    │
│  ← mr-8 →                ← flex-1 →      ← space-x-2 →    │
└─────────────────────────────────────────────────────────────┘
```

| Prop | Type | Description |
|------|------|-------------|
| `brandName` | `ReactNode` | Contenu du lien brand (icône + texte + badge) |
| `homeLinkProps` | `{ href, title }` | Destination du lien brand |
| `navigation` | `ReactNode` | Liens de navigation desktop |
| `quickAccessItems` | `ReactNode` | Zone droite (user menu, switch thème) |

- **Wrapper** : `sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur`
- **Hauteur** : `h-16`
- **Brand** : `flex items-center gap-2 text-lg font-bold tracking-tight`
- **Mobile** : `Sheet` slide-out (< `md`)

#### Header tenant (`apps/web/src/ui/Header.tsx`)

Même structure mais :
- **Hauteur** : `h-14` (plus compact)
- **Brand** : `serviceName` string (pas ReactNode) — juste le nom du tenant en `font-bold`
- Pas de badge, pas d'icône brand

---

### Footer

Deux variantes : **RootFooter** (root pages) et **Footer** (tenant pages).

#### RootFooter (`apps/web/src/ui/RootFooter.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│  [Brand icon + name]     [Produit]  [Ressources] [Légal]│
│  [Description]           [liens]    [liens]      [liens]│
│  [Badges]                                               │
│  [Version]                                              │
├─────────────────────────────────────────────────────────┤
│  [Copyright]                            [License]       │
└─────────────────────────────────────────────────────────┘
```

- **Background** : `border-t bg-muted/50`
- **Grid** : `grid-cols-2 md:grid-cols-4 lg:grid-cols-5` — brand col-span-2 + 3 colonnes liens
- **Brand** : icon + name en `text-primary`
- **Links** : `text-muted-foreground hover:text-primary` + focus-visible ring
- **Bottom** : `Separator` + copyright/license en `text-xs text-muted-foreground`

#### Footer tenant (`apps/web/src/ui/Footer.tsx`)

Plus simple : `serviceName` + `contentDescription` + `bottomLinks` (flat) + `license`.
- **Background** : `border-t bg-muted/40` (légèrement plus transparent que le root)

---

### SkipLinks

**Source** : `apps/web/src/ui/SkipLinks.tsx` — navigation d'accessibilité.

- Deux liens : `#content` (main) et `#footer`
- `sr-only` par défaut, visible au `focus-within`
- Style : `bg-primary text-primary-foreground rounded-md px-4 py-2`
- Position : `fixed top-0 left-0 z-[9999]`
- i18n : namespace `skipLinks`

---

## Typographie

| Élément | Classes | Contexte |
|---------|---------|----------|
| Hero titre | `text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance` | Landing h1 |
| Hero accent | `bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent` | Mot-clé gradient dans le h1. **PAS d'italic.** |
| Section heading | `text-xl font-semibold` | Titre de section (bento cards) |
| Sub-heading | `text-base font-semibold` | Sous-titres dans les cartes |
| Label uppercase | `text-[10px] font-bold uppercase tracking-wider` | Badges, labels kanban, catégories |
| Label small | `text-[11px] font-bold uppercase tracking-wider text-muted-foreground` | En-têtes de colonnes |
| Body hero | `text-lg leading-relaxed text-muted-foreground` | Description sous le titre hero |
| Body card | `text-sm text-muted-foreground` | Descriptions dans les cartes |
| Body xs | `text-xs text-muted-foreground` | Métadonnées, timestamps |

---

## Layout & spacing

### Container

```tsx
<div className="mx-auto max-w-7xl px-6">
```

Utilisé pour toutes les sections de la landing page. Les composants Header/Footer utilisent `container mx-auto px-4 sm:px-6 lg:px-8` (responsive padding).

### Bento grid

```tsx
<div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-12">
  <Card className="md:col-span-8 md:row-span-2">  {/* Grande carte */}
  <Card className="md:col-span-4 md:row-span-2">  {/* Carte latérale */}
  <Card className="md:col-span-4">                 {/* Petite carte */}
  <Card className="md:col-span-8">                 {/* Large carte */}
</div>
```

12 colonnes, `gap-6`, `auto-rows-min`. Mobile : stack vertical (1 colonne).

### Section spacing

| Section | Padding |
|---------|---------|
| Hero | `py-24 md:py-32` |
| Bento grid | `pb-24` |
| CTA section | `pb-24` |
| Footer top | `pt-20 pb-12` |

### CTA block (fond primary)

```tsx
<div className="overflow-hidden rounded-2xl bg-primary px-12 py-20 text-center text-primary-foreground md:py-24">
```

`rounded-2xl` pour le conteneur, texte centré, padding généreux.

---

## Icônes

- **Librairie** : `lucide-react`
- **Brand** : `Map` (utilisé dans header + footer)

### Convention de taille

| Contexte | Classe | Exemple |
|----------|--------|---------|
| Inline (boutons, badges) | `size-4` | `<ArrowRight className="size-4" />` |
| Section header | `size-5` | `<Plug className="size-5" />` |
| Card feature | `size-6` | `<Vote className="size-6" />` |
| Menu burger | `size-5` | `<Menu className="size-5" />` |

### Mapping des icônes utilisées

| Icône | Usage |
|-------|-------|
| `Map` | Brand (header, footer) |
| `Vote` | Feature vote citoyen |
| `Lightbulb` | Label suggestion |
| `ThumbsUp` / `ThumbsDown` | Boutons vote |
| `Plug` | Section intégrations |
| `StickyNote` | Notion (actif) |
| `LayoutDashboard` | Jira (grisé) |
| `Terminal` | Slack (grisé) |
| `Share2` | Linear (grisé) |
| `ArrowRight` | CTA arrow |
| `Menu` / `X` | Burger menu mobile |

### Icône grisée (intégration inactive)

```tsx
<div className="flex flex-col items-center gap-2 opacity-30 grayscale">
  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
    <LayoutDashboard className="size-6" />
  </div>
  <span className="text-[10px] font-bold">Jira</span>
</div>
```

---

## DSFR — séparation & coexistence

### Principe (DDR-0002)

Le DSFR est **légalement restreint** aux entités publiques autorisées. Le root n'est pas une entité publique → zéro DSFR sur le root.

### Architecture

| Scope | DSFR | shadcn/Default |
|-------|------|----------------|
| Root layout (`apps/web/src/app/layout.tsx`) | Aucun import | `ThemeScript`, `UIProvider("Default")` |
| Tenant layout (theme=Dsfr) | `DsfrProvider` (toujours), `ConsentBanner`, `Header` DSFR, `Footer` DSFR | — |
| Tenant layout (theme=Default) | `DsfrProvider` (toujours, hooks DSFR dans les pages) | `ShadcnHeader`, `ShadcnFooter` |

### CSS resets (`globals.scss`)

Le DSFR injecte des styles base non-layered qui battent Tailwind `@layer utilities`. Les resets dans `[data-ui-theme="Default"]` neutralisent :

- `a { text-decoration: none; background-image: none; }` — DSFR force underline sur tous les `<a>`
- `h1-h6 { font-size: revert-layer; line-height: revert-layer; }` — DSFR override les tailles de heading
- `ul, ol { list-style: revert-layer; padding: revert-layer; }` — DSFR strip les puces de liste

### ThemeInjector (`apps/web/src/ui/ThemeInjector.tsx`)

Client component qui injecte `data-ui-theme` sur `<html>` quand un tenant a un thème différent de Default :

```tsx
useEffect(() => {
  document.documentElement.dataset.uiTheme = theme;
}, [theme]);
```

Le root layout met `data-ui-theme="Default"` en statique. Le `ThemeInjector` override côté client quand on navigue vers un tenant Dsfr.

### Convention SCSS modules

`root.module.scss` utilise des sélecteurs conditionnels pour que les mêmes classes fonctionnent dans les deux thèmes :

```scss
:global([data-ui-theme="Default"]) .app {
    background-color: var(--background);       /* token shadcn */
    color: var(--foreground);
}
:global([data-ui-theme="Dsfr"]) .app {
    background-color: var(--background-default-grey);  /* token DSFR */
    color: var(--text-default-grey);
}
```

---

## Fichiers clés

| Fichier | Contenu |
|---------|---------|
| `apps/web/src/app/globals.scss` | Tokens CSS (palette light+dark), Tailwind bridge, DSFR resets |
| `apps/web/src/app/root.module.scss` | Styles `.app` / `.content` conditionnels par thème |
| `apps/web/src/app/layout.tsx` | Root layout — DSFR-free, `ThemeScript`, `UIProvider("Default")` |
| `apps/web/src/app/ThemeScript.tsx` | Script anti-FOUC dark mode |
| `apps/web/src/app/[domain]/(domain)/layout.tsx` | Tenant layout — always `DsfrProvider`, conditional Header/Footer |
| `apps/web/src/ui/types.ts` | `UiTheme = "Default" \| "Dsfr"` |
| `apps/web/src/ui/UIContext.tsx` | `UIProvider` + `useUI()` |
| `apps/web/src/ui/server.ts` | `getTheme(settings)` |
| `apps/web/src/ui/ThemeInjector.tsx` | Client-side `data-ui-theme` injection |
| `apps/web/src/ui/bridge/` | 15 bridge components (UIAlert, UIBadge, UIButton, UIMarkdownEditor, UISwitch, etc.) — dual-theme via `React.lazy()` |
| `apps/web/src/app/showcase/` | Showcase page — tous les bridges, toggle theme + dark mode |
| `packages/ui/src/lib/cn.ts` | `cn()` — wrapper `clsx` + `tailwind-merge` |
| `packages/ui/src/components/button.tsx` | Button (cva, 6 variants, 8 sizes) |
| `packages/ui/src/components/card.tsx` | Card + sub-components |
| `packages/ui/src/components/badge.tsx` | Badge (cva, 6 variants) |
| `apps/web/src/ui/RootHeader.tsx` | Header root (h-16, brandName ReactNode) |
| `apps/web/src/ui/Header.tsx` | Header tenant (h-14, serviceName string) |
| `apps/web/src/ui/RootFooter.tsx` | Footer root multi-colonnes |
| `apps/web/src/ui/Footer.tsx` | Footer tenant simple |
| `apps/web/src/ui/SkipLinks.tsx` | Navigation accessibilité |
| `apps/web/src/app/(default)/page.tsx` | Landing page (hero, bento, CTA) |
| `docs/ddr/` | Design Decision Records |
