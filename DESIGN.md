# DESIGN.md : Roadmaps Faciles (thème : Default / French Blue)

> Roadmaps Faciles est une plateforme française de civic-tech pour le feedback
> et la gestion de roadmaps. Elle embarque deux thèmes parallèles : **Default**
> (style shadcn, French Blue, décrit ici) et **Dsfr** (système de design officiel
> de l'État français, intouchable, réglementé). Ce fichier décrit
> **uniquement** le thème Default. En cas de doute, privilégier la retenue, la
> chaleur institutionnelle et zéro ornementation.

---

## 1. Visual Theme & Atmosphere

**Ambiance** : digne de confiance, moderne, proche de l'esthétique gouvernementale
sans être pesante. Civic tech plutôt que SaaS entreprise. Le produit héberge du
feedback public sur des roadmaps politiques ou produit ; les utilisateurs vont
du citoyen au contributeur en passant par l'admin.

**Densité** : aérée. Rythme vertical généreux, hero sections amples, place pour
respirer entre les blocs. Jamais à l'étroit, jamais "marketing-page-bruyant".

**Ton de la copie UI** : direct, calme, en français. Sentence case sur les
titres et les boutons (pas de Title Case, pas de UPPERCASE sauf sur les
micro-labels). Pas de point d'exclamation dans la copie produit.

**Signature visuelle** :
- Une seule couleur de marque, **French Blue** (`#163C90`), utilisée avec parcimonie pour l'action et les accents clés.
- Le light mode est le défaut. Le dark mode est pleinement supporté et n'est pas une simple inversion : il prend des surfaces Prussian Blue et un primaire plus clair pour le contraste.
- Hiérarchie typographique. La hiérarchie par décoration est interdite.
- Les bordures, les ajustements d'opacité et le whitespace portent la profondeur. Pas les ombres.

**Vibes de référence** (mixer, ne pas copier) :
- La retenue et la hiérarchie typographique de Linear.
- La discipline du whitespace de Vercel.
- Une chaleur institutionnelle française (ex. ADEME, gouv.fr, mais décoincée).

**Anti-vibes** (à éviter) :
- Gradients SaaS vifs, glows néon, reflets glassy.
- Illustrations "friendly tech" arrondies.
- Densité "salle de marché", dashboard data-vomit.

---

## 2. Color Palette & Roles

Toutes les valeurs en OKLCH (perceptuellement uniforme, P3-ready). Le light mode
est canonique ; le dark mode suit les mêmes rôles sémantiques.

### Seed de marque

| Nom | Hex | OKLCH | Notes |
|---|---|---|---|
| French Blue | `#163C90` | `oklch(0.386 0.146 263)` | Seul accent de marque |
| Regal Navy | `#1F2F66` | `oklch(0.350 0.114 263)` | Texte sur lavande |
| Smart Blue | `#5B6E9F` | `oklch(0.542 0.104 265)` | Texte secondaire, focus ring |
| Wisteria | `#A4ADC8` | `oklch(0.700 0.066 266)` | UI subtile, texte dark-mode |
| Lavender | `#D1D6E4` | `oklch(0.853 0.031 265)` | Surfaces secondaires |
| Light Lavender | `#ECEEF5` | `oklch(0.935 0.015 265)` | Fills muted |
| Lavender border | `#DDE1EC` | `oklch(0.885 0.020 265)` | Toutes les bordures |
| Carbon Black (teinte bleue) | `#1F293E` | `oklch(0.252 0.041 264)` | Texte body |
| Prussian Blue | `#27334D` | `oklch(0.260 0.030 264)` | Surface card dark-mode |
| Twilight Indigo | `#2D3A5C` | `oklch(0.313 0.079 264)` | Secondaire dark-mode |

### Rôles sémantiques (light mode)

```css
:root, [data-ui-theme="Default"] {
  /* Surfaces */
  --background: oklch(1 0 0);                  /* fond de page, blanc */
  --foreground: oklch(0.252 0.041 264);        /* texte body */
  --card: oklch(1 0 0);                        /* surface card */
  --card-foreground: oklch(0.252 0.041 264);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.252 0.041 264);

  /* Marque */
  --primary: oklch(0.386 0.146 263);           /* French Blue */
  --primary-foreground: oklch(1 0 0);

  /* Secondaire */
  --secondary: oklch(0.853 0.031 265);         /* Lavender */
  --secondary-foreground: oklch(0.350 0.114 263);

  /* Muted */
  --muted: oklch(0.935 0.015 265);             /* Light Lavender */
  --muted-foreground: oklch(0.542 0.104 265); /* Smart Blue */

  /* Accent (hover uniquement) */
  --accent: oklch(0.920 0.020 265);
  --accent-foreground: oklch(0.350 0.114 263);

  /* Statuts */
  --destructive: oklch(0.577 0.245 27.325);    /* rouge */
  --destructive-foreground: oklch(1 0 0);
  --success: oklch(0.723 0.191 142.5);         /* vert */
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.769 0.189 70.08);         /* ambre */
  --warning-foreground: oklch(0.252 0.041 264);

  /* Lignes */
  --border: oklch(0.885 0.020 265);
  --input: oklch(0.885 0.020 265);
  --ring: oklch(0.542 0.104 265);              /* Smart Blue, focus */

  /* Chart : 5 couleurs, du brand vers les accents */
  --chart-1: oklch(0.386 0.146 263);  /* French Blue */
  --chart-2: oklch(0.542 0.104 265);  /* Smart Blue */
  --chart-3: oklch(0.700 0.066 266);  /* Wisteria */
  --chart-4: oklch(0.646 0.222 41);   /* accent orange */
  --chart-5: oklch(0.600 0.180 145);  /* accent vert */
}
```

### Rôles sémantiques (dark mode)

```css
.dark[data-ui-theme="Default"] {
  --background: oklch(0.220 0.010 264);   /* Carbon Black, légèrement plus bleuté */
  --foreground: oklch(0.920 0.015 265);   /* proche Lavender */
  --card: oklch(0.260 0.030 264);         /* Prussian Blue, un cran au-dessus */
  --popover: oklch(0.260 0.030 264);

  --primary: oklch(0.620 0.130 264);      /* bleu plus clair pour le contraste */
  --primary-foreground: oklch(1 0 0);

  --secondary: oklch(0.313 0.079 264);    /* Twilight Indigo */
  --secondary-foreground: oklch(0.853 0.031 265);

  --muted: oklch(0.313 0.060 264);
  --muted-foreground: oklch(0.700 0.066 266);  /* Wisteria */

  --accent: oklch(0.340 0.060 264);
  --accent-foreground: oklch(0.853 0.031 265);

  --destructive: oklch(0.396 0.141 25.723);
  --success: oklch(0.600 0.180 145);
  --warning: oklch(0.700 0.170 65);

  --border: oklch(0.310 0.025 260);              /* contraste bas */
  --input: oklch(0.310 0.025 260);
  --ring: oklch(0.542 0.104 265);
}
```

**Règles d'usage** :
- `--primary` est réservé aux actions primaires, aux marques de brand et à l'unique gradient du hero. Jamais comme accent générique sur du texte, des icônes ou des bordures.
- Les hover states utilisent `--accent` (light) et jamais un glow teinté brand.
- La sidebar a une teinte légèrement plus froide (`--sidebar-background` ~5% sous le fond de page) pour se lire comme une surface distincte sans recourir à une ombre.
- Les cartes de statut (en cours / livré / priorité) teintent les bordures et fonds à très basse opacité (`/20`, `/[0.02]`), jamais au-dessus de 10% d'alpha sur les fonds.

---

## 3. Typography Rules

Stack sans-serif système par défaut. Pas de chargement de font custom. La
hiérarchie vit dans le **poids** et la **taille**, pas dans la famille ni le
swap de famille.

**Fallback Google Fonts** si le stack système doit être substitué : `Inter`
(400, 500, 600, 700, 800) pour sans, `JetBrains Mono` (400, 500) pour mono.

### Échelle

| Rôle | Taille | Poids | Tracking / Leading | Usage |
|---|---|---|---|---|
| Display / Hero h1 | `text-5xl md:text-7xl` (48 → 72px) | `font-extrabold` (800) | `tracking-tight leading-[1.1]`, `text-balance` | Hero de landing |
| Mot d'accent hero | idem | idem | idem | `bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent`. Jamais en italique. |
| Titre de section | `text-xl` (20px) | `font-semibold` (600) | normal | Titres de cartes bento |
| Sous-titre | `text-base` (16px) | `font-semibold` (600) | normal | Sous-titres dans les cartes |
| Body hero | `text-lg leading-relaxed` (18px) | 400 | normal, `text-muted-foreground` | Description sous le hero |
| Body | `text-base` (16px) | 400 | normal | Paragraphe par défaut |
| Body card | `text-sm` (14px) | 400 | normal, `text-muted-foreground` | Descriptions de carte |
| Body xs | `text-xs` (12px) | 400 | normal, `text-muted-foreground` | Métadonnées, timestamps |
| Label uppercase | `text-[10px]` | `font-bold` (700) | `uppercase tracking-wider` | Tags, labels kanban, catégories |
| Label small | `text-[11px]` | `font-bold` (700) | `uppercase tracking-wider`, `text-muted-foreground` | En-têtes de colonnes |
| Mono / version | `font-mono text-[10px]` | 400 | normal | Pills de version, hashes |

### Discipline des titres

- Un seul h1 par page. Le h1 est le sujet de la page en sentence case.
- Le h2 introduit une section ; jamais décoré d'une icône en lead sauf si l'icône est informationnelle.
- Les titres n'utilisent jamais la couleur de marque en remplissage de texte, sauf le mot d'accent du hero avec `bg-clip-text`.
- Jamais d'italique dans la copie UI. L'italique est réservé aux citations et aux mots en langue étrangère dans le contenu long.

---

## 4. Component Stylings

### Button

6 variants, 8 tailles. **Zéro shadow. Zéro glow.** Le hover se fait uniquement
par opacité.

| Variant | Background | Foreground | Hover | Quand l'utiliser |
|---|---|---|---|---|
| `default` | `bg-primary` | `text-primary-foreground` | `bg-primary/90` | CTA primaire, l'unique action par écran |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | `bg-secondary/80` | Action alternative |
| `outline` | `bg-background` + `border` | `text-foreground` | `bg-accent` | Actions inline dans les cartes, lignes de table |
| `ghost` | transparent | `text-foreground` | `bg-accent text-accent-foreground` | Liens de nav, actions tertiaires |
| `destructive` | `bg-destructive` | `text-white` | `bg-destructive/90` | Suppression, irréversible |
| `link` | aucun | `text-primary underline-offset-4` | `underline` | Lien inline stylé en bouton |

**Tailles** (hauteur) :
- `xs` 24px / `sm` 32px / `default` 36px / `lg` 40px
- `icon` 36px carré / `icon-xs` 24px / `icon-sm` 32px / `icon-lg` 40px

**Radius** : `--radius` (10px) pour tous les boutons.

**Focus** : utilitaire `ui-focus-ring`, `focus-visible:ring-ring/50 ring-[3px]`.

**Disabled** : `disabled:cursor-not-allowed disabled:opacity-50`.

**Inversion sur fond brand/sombre** : quand un CTA primaire est posé sur un
panneau `bg-primary`, inverser les couleurs : `bg-primary-foreground !text-primary
hover:bg-primary-foreground/90`. Secondaire sur le même panneau :
`variant="ghost"` + `border-primary-foreground/20 text-primary-foreground
hover:bg-primary-foreground/10`.

### Card

Base : `bg-card text-card-foreground rounded-xl border py-6 shadow-sm`. **Toujours
override `shadow-sm` en `shadow-none`.** Jamais `shadow-md`/`lg` sur une carte.

Hiérarchie de profondeur (portée par l'opacité des bordures) :

| Niveau | Recette | Padding | Usage |
|---|---|---|---|
| Outer | `border-border/40 shadow-none` | `p-8` | Cartes bento principales, sections de page |
| Inner | `border-border/30 shadow-none` | `p-4` | Cartes imbriquées (kanban items, blocs de form) |
| Status | `border-{color}/20 shadow-none` | `p-4` | Indicateur sémantique |
| Accent fill | `+ bg-muted/30` | : | Zone secondaire dans une carte outer |

**Recettes de statut** :
- En cours : `border-primary/20 bg-primary/[0.02]`
- Livré : `border-emerald-100/50 bg-emerald-50/20 dark:border-emerald-900/50 dark:bg-emerald-950/20`
- Priorité : `border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/30`

Sous-composants : `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`
(slot top-right), `CardContent`, `CardFooter`.

### Badge

6 variants, compact. Pas d'ombres.

| Variant | Recette | Usage |
|---|---|---|
| `default` | `bg-primary text-primary-foreground` | Statut actif |
| `secondary` | `bg-secondary text-secondary-foreground` | Info neutre |
| `outline` | `border-border text-foreground` | Tag subtil |
| `destructive` | `bg-destructive text-white` | Erreur / bloquant |
| `ghost` | transparent | Catégorie légère |
| `link` | `text-primary underline` | Tag stylé en lien |

**Patterns** :
- Pill BETA : `variant="outline"` + `flex gap-2 px-3 py-1`, mot brand en primary, descripteur en muted, séparés par une bordure gauche.
- Statut kanban : bordé + fill faiblement teinté, `text-[10px] font-bold uppercase`, avec des variants `dark:` explicites.
- Version : `variant="outline" font-mono text-[10px] text-muted-foreground`.

### Input

`h-9 rounded-md border bg-background px-3 py-1 text-sm`. Le focus utilise
`ui-focus-ring`. L'état invalide utilise `ui-invalid-ring` (ring rouge à 20%
d'opacité). Le placeholder est `text-muted-foreground`. Jamais styler les
inputs avec des inset shadows.

### Header

Sticky top, backdrop semi-transparent.

- **Root header** : `h-16`, `sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur`. Zone brand (icône + nom + badge optionnel) à gauche, nav au centre, quick-access (menu user, toggle thème) à droite.
- **Tenant header** : `h-14` (plus compact), le brand n'est que le nom du service en `font-bold`, pas d'icône, pas de badge.
- Mobile (`< md`) : la nav se replie derrière un burger qui ouvre un sheet slide-out.

### Footer

- **Root footer** : `border-t bg-muted/50`, grille multi-colonnes (`grid-cols-2 md:grid-cols-4 lg:grid-cols-5`). Colonne brand sur 2 cols (icône + nom + courte description), suivie des colonnes Produit / Ressources / Légal. Ligne du bas : copyright à gauche, licence à droite, séparées par un `Separator` 1px. Couleur des liens : `text-muted-foreground hover:text-primary` avec focus ring.
- **Tenant footer** : ligne unique, `bg-muted/40` (légèrement plus transparent).

### Skip links (a11y)

Deux liens (`#content`, `#footer`). `sr-only` par défaut, visible au
`focus-within`. Pill : `bg-primary text-primary-foreground rounded-md px-4 py-2`,
positionné `fixed top-0 left-0 z-[9999]`.

### Navigation menu, Dropdown, Dialog, Sheet, Popover

Tous suivent les primitives shadcn / Radix avec l'utilitaire
`ui-popover-animate` (fade-in/out + zoom-95 + slide directionnel de 2px). L'overlay
utilise `ui-overlay` (`bg-black/50`, `z-50`, fade-in/out). Les boutons de
fermeture utilisent `ui-close-button` (top-right, opacité 70 → 100 au hover).

---

## 5. Layout Principles

### Container

```
max-w-7xl  (1280px)   largeur de contenu par défaut
px-6                  padding horizontal par défaut
sm:px-6 lg:px-8       headers et footers utilisent un padding responsive
```

### Rythme vertical des sections

| Section | Padding |
|---|---|
| Hero | `py-24 md:py-32` (96 / 128px) |
| Bento grid | `pb-24` |
| Section CTA | `pb-24` |
| Top du footer | `pt-20 pb-12` |
| Section de formulaire | `py-12` |
| Section inline | `py-8` |

### Échelle de spacing (défauts Tailwind, utilisés tels quels)

`gap-1` 4px, `gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-6` 24px, `gap-8`
32px, `gap-12` 48px. **Rythme par défaut : gaps de 4 / 8 / 16 / 24px.** Tout
au-dessus de 24px est du whitespace intentionnel.

### Bento grid

Desktop 12 colonnes (`md:grid-cols-12`), `gap-6`, `auto-rows-min`. Mobile :
collapse en une seule colonne. Les cartes occupent `md:col-span-4`,
`md:col-span-6`, `md:col-span-8`. Les cartes hero peuvent ajouter
`md:row-span-2`.

### Radius

- Global `--radius` = `0.625rem` (10px), utilisé par les boutons et la plupart des surfaces.
- Carte outer : `rounded-xl` (12px).
- Blocs CTA, panneaux feature : `rounded-2xl` (16px).
- Pills, badges, skip links : `rounded-md` (6px).

### Offset sticky

Utiliser `--sticky-offset: 4rem` (= h-16 du root header) quand des éléments
sticky doivent passer sous le header.

---

## 6. Depth & Elevation

**Pas d'ombres sur les cartes. Pas de drop shadows sur les surfaces UI.** C'est
la règle visuelle la plus forte du système.

La profondeur passe par :

1. **Opacité de bordure** : cartes outer `border-border/40`, cartes inner `border-border/30`, cartes status `border-{color}/20`.
2. **Teinte de surface** : en dark mode, les cartes sont Prussian Blue (`oklch(0.260 0.030 264)`) un cran au-dessus du fond de page. En light mode, les cartes sont en blanc pur sur fond quasi-blanc (la bordure suffit à les détacher).
3. **Backdrop blur** sur le header sticky (`bg-background/95 backdrop-blur`).
4. **Whitespace** : grands gaps entre sections, padding généreux dans les cartes.

**Exceptions tolérées** (rares) :
- `shadow-sm` sur le submenu ouvert du menubar (couche popover Radix), hérité des défauts de la primitive. Le tone-down si jamais ça devient visible.
- `ring-offset-background focus:ring-ring focus:ring-2 focus:ring-offset-2` sur les boutons de fermeture focus-ables (a11y, pas profondeur visuelle).

**Interdits** :
- `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` n'importe où.
- `shadow-primary/*` ou n'importe quelle ombre teintée brand.
- Inset shadows sur les inputs.
- Drop shadows sur les illustrations ou icônes.
- "Glassmorphism" backdrop blur sur les cartes inner.

---

## 7. Do's and Don'ts

### Do

- Utiliser **une seule** couleur primaire (French Blue) par écran. Le CTA est le seul endroit où primary vit.
- Hover par opacité (`/90`, `/80`), jamais par shift de teinte.
- Porter la sémantique de statut par bordure + tint basse opacité, jamais par fill vif.
- Fournir des variants `dark:` explicites quand on sort de la palette de tokens (emerald, amber, etc.).
- Composer avec `cn()` (`clsx` + `tailwind-merge`) pour que les consumers puissent override en toute sécurité.
- Refléter la composition d'utility DSFR : `cx(fr.cx("dsfr-class"), "tw-class")` quand (et seulement quand) on fait le pont vers le thème Dsfr. Les écrans Default-only restent en Tailwind pur.
- Garder la copie en français, sentence case pour les boutons et les titres.
- Respecter l'a11y : focus ring visible (`ui-focus-ring`), contraste minimum 4.5:1 sur le texte body, 3:1 sur les composants UI.

### Don't

- Pas d'ombres sur les cartes, panneaux, modales ou popovers au-delà de `shadow-sm`. Sans exception.
- Pas de gradients sur les éléments UI (boutons, cartes, badges, headers, footers). Le mot d'accent du hero est le **seul** gradient du système.
- Pas de glow, pas de néon, pas de "glass reflections".
- Pas d'italique dans la copie UI.
- Pas de boutons icon-only sans `aria-label`.
- Pas de mélange de la couleur primary avec des couleurs sémantiques de statut (rouge, ambre, vert) dans le même composant.
- Pas de styles inline (`style={{ ... }}`) sauf dans les templates email.
- Pas de classes DSFR dans les écrans du thème Default. Les deux thèmes ne co-render jamais visuellement.
- Pas de `<table>` brute pour les données tabulaires d'admin. Utiliser la primitive `Table`.
- Pas de magic numbers dans les tokens. Les nouveaux tokens passent par des déclarations `--token-*`, pas du hex hardcodé.

---

## 8. Responsive Behavior

### Breakpoints (défauts Tailwind)

| Nom | Largeur min | À lire comme |
|---|---|---|
| `sm` | 640px | Grand téléphone, petite tablette |
| `md` | 768px | Tablette, petit laptop |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Grand desktop |

### Patterns mobile-first

- La typo scale **vers le haut** avec les modifiers `md:` (`text-5xl md:text-7xl`), jamais vers le bas.
- Les grilles collapse en colonne unique sous `md`. Le bento devient un stack vertical.
- Le CTA hero stack verticalement sous `sm`. Les boutons passent en pleine largeur (`w-full sm:w-auto`).
- Les colonnes du footer collapse à 2 cols sur `sm`, colonne unique en dessous.

### Navigation

- Sous `md` : burger menu (icône `Menu`) qui ouvre un `Sheet` slide-out. Le contenu du sheet est la même nav, en stack vertical, avec des cibles tactiles pleine largeur (44px min).
- À `md` et au-dessus : liens de nav inline dans le header.

### Cibles tactiles

- Surface de hit minimum 44 × 44 px sur tout élément interactif aux largeurs mobile.
- Les tailles de bouton `xs` et `sm` sont réservées au desktop. Sur mobile, basculer sur `default` ou `lg`.

### Accommodation typo

- Texte body jamais en dessous de 14px sur mobile. Le texte caption (`text-xs`) est réservé aux métadonnées.
- Longueur de ligne : viser 60 à 75 caractères sur les paragraphes denses en prose. Utiliser `max-w-prose` ou `max-w-2xl` sur les blocs long-form.

---

## 9. Agent Prompt Guide

Prompts réutilisables que Claude Design peut appliquer à tout nouvel écran,
composant ou variant. Lecture toujours dans l'ordre : Theme → Color → Type →
Component → Layout → Elevation → Do/Don't → Responsive.

### Quand on te demande de designer un nouveau composant

1. Prendre la primitive existante la plus proche (`Button`, `Card`, `Badge`, `Input`, `Dialog`, `Popover`). L'étendre par variant ou className, ne pas la forker.
2. État par défaut : surface neutre, `border-border/40`, pas d'ombre.
3. État hover : drop d'opacité sur le background, ou `bg-accent` pour le style ghost.
4. État focus : `ui-focus-ring`, visible à 3px.
5. État disabled : `opacity-50 cursor-not-allowed`.
6. Dark mode : revérifier chaque appel de couleur. Les tokens portent ça automatiquement ; les couleurs sémantiques (emerald, amber, red) demandent des variants `dark:` explicites.

### Quand on te demande de designer une nouvelle page

1. Container : `mx-auto max-w-7xl px-6`.
2. Hero (si présent) : `py-24 md:py-32`, h1 en `text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance`, sous-copie en `text-lg text-muted-foreground`.
3. Sections en dessous : bento grid 12 cols quand le contenu suggère plusieurs niveaux de densité ; sinon stack avec `gap-12` entre blocs.
4. Section CTA : `rounded-2xl bg-primary text-primary-foreground px-12 py-20 text-center`. Inverser les couleurs de bouton.
5. Footer : uniquement sur les pages root ; les pages tenant utilisent le footer tenant compact.

### Quand on te demande de designer un statut, un badge de statut ou une carte kanban

1. Choisir la couleur sémantique (primary / emerald / amber / red).
2. Appliquer une bordure à `/20` d'opacité et un fond à `/[0.02]` ou `/20`.
3. Fournir un contrepoint `dark:` avec des bordures `/50` et des fonds `/20` dans la famille de shade plus profonde.
4. Label à l'intérieur : `text-[10px] font-bold uppercase tracking-wider`.

### Quand on te demande de l'"elevation" ou de la "profondeur"

Refuser les ombres. Reformuler : la profondeur dans ce système vient de
l'opacité de bordure, du shift de teinte de surface, du whitespace et du
backdrop blur sur les surfaces sticky. Puis proposer un des quatre.

### Quand on te demande un look "plus fancy" ou "plus premium"

Pas de gradients, pas de glows, pas d'ombres. À la place, proposer :
- Typo plus serrée (`tracking-tight`), poids plus lourd sur le display, saut de taille plus grand.
- Plus de whitespace (`py-32`, `gap-12`).
- Un seul mot d'accent dans le bg-clip de gradient sur le hero.
- Paire de bordures à contraste plus élevé (outer `/60` + inner `/30`) sur le bento.

### Quand on te demande un look "plus sombre" ou "plus techy"

Utiliser le dark mode comme canvas, garder French Blue en primary (pas du
néon), pousser le texte muted vers Wisteria (`oklch(0.700 0.066 266)`), et
garder les surfaces de carte à Prussian Blue (`oklch(0.260 0.030 264)`). Ne
jamais basculer vers un accent de marque vert ou rouge.

### Quand on te demande un look "gouvernement français" (DSFR)

Ne pas le générer. Le thème Dsfr de Roadmaps Faciles est régi par le système
de design officiel de l'État français et est consommé via `react-dsfr`, pas
réimplémenté. Répondre poliment : "le thème Dsfr est hors scope pour Claude
Design ; seul le thème Default est dans le scope ici."

### Dans le doute

La retenue gagne. Retirer un ornement, ajouter du whitespace, baisser une
opacité. La marque est calme et confiante, pas bruyante.
