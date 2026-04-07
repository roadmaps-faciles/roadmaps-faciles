---
name: sync-docs
description: Synchronise la documentation du projet (CLAUDE.md, memory, README, ADR, DDR, design system, content) avec les features implementees
---

# Synchronisation de la documentation

Met a jour l'ensemble de la documentation du projet en coherence avec les features implementees dans la session courante. Chaque etape produit un diff ou un resume visible par l'utilisateur.

## 1. Analyse des changements

Identifie les fichiers modifies/crees dans la session et la branche courante :

```bash
git diff dev --name-only
git log dev..HEAD --oneline
```

Resume les features et decisions architecturales nouvelles.

## 2. CLAUDE.md — Revise via skill

Lance le skill `/claude-md-management:revise-claude-md` avec comme arguments un resume des learnings de la session.

Si le skill propose des modifications, les appliquer apres validation utilisateur.

## 3. Memory — Synchronisation

Lis le fichier MEMORY.md du projet. Le chemin est indique dans le system prompt (section "auto memory"). Si tu es dans un worktree, le MEMORY.md a lire/ecrire est celui du repo principal (pas celui du worktree) — remonte au chemin racine du projet original pour le trouver.

Lis aussi le `CLAUDE.md` du projet.

Compare les deux et identifie :
- **Doublons** : informations presentes dans les deux fichiers — proposer de les retirer de MEMORY.md (CLAUDE.md fait foi car partage avec l'equipe)
- **Memory-only** : informations dans MEMORY.md absentes de CLAUDE.md — evaluer si elles meritent d'etre dans CLAUDE.md (partageables) ou si elles restent en memory (personnelles/contextuelles)
- **Obsoletes** : informations qui ne correspondent plus au code actuel — proposer de les supprimer
- **Nouveaux learnings** : patterns, gotchas, ou conventions decouverts dans la session — proposer de les ajouter au bon endroit

Presente les modifications proposees et applique-les apres validation utilisateur.

**Regle** : MEMORY.md doit rester sous 200 lignes (au-dela, le contenu est tronque). Si necessaire, creer des fichiers de detail (ex: `debugging.md`, `patterns.md`) et y faire reference depuis MEMORY.md.

## 4. README.md — Mise a jour

Lis `README.md` a la racine et verifie sa coherence avec l'etat actuel du projet :

- **Stack & decisions cles** : versions a jour (Next.js, Node, Prisma, etc.), nouvelles technologies/patterns majeurs
- **Variables d'environnement** : nouvelles variables ajoutees dans `src/config.ts` non documentees dans le README
- **Structure de repertoires** : nouveaux dossiers significatifs (ex: `src/lib/dns-provider/`)
- **Scripts utiles** : nouvelles commandes ajoutees dans `package.json`
- **Reference aux ADR** : si de nouveaux ADR sont crees (etape 5), verifier que la section ADR du README est a jour

Ne modifier que ce qui est factuellement incorrect ou manquant. Ne pas changer le style ou la mise en forme existante.

Presente les modifications proposees et applique-les apres validation utilisateur.

## 5. Documentation utilisateur/technique — `content/`

Le dossier `content/docs/` contient la documentation utilisateur et technique du projet en MDX (rendue sur `/doc/*`). Elle est organisee en sections :

- `content/docs/concepts/` — Concepts metier (roles, tableaux, statuts, espaces)
- `content/docs/guides/` — Guides utilisateur (creer un compte, voter, etc.)
- `content/docs/admin/` — Documentation admin (membres, webhooks, domaines, etc.)
- `content/docs/moderation/` — Documentation moderateur
- `content/docs/technical/` — Documentation technique (DNS, self-hosting, deploiement, securite)

### Procedure

**A. Scan cible (changements de la session)**

1. A partir de l'analyse des changements (etape 1), identifie les pages MDX potentiellement impactees :
   - Changements auth/roles → `concepts/roles.mdx`, `admin/members.mdx`, `admin/authentication.mdx`
   - Changements DNS/domaines → `technical/dns.mdx`, `technical/self-hosting.mdx`, `admin/custom-domains.mdx`
   - Nouvelles env vars → `technical/self-hosting.mdx` (section Variables d'environnement)
   - Changements moderation → `moderation/`
   - Nouvelles fonctionnalites utilisateur → `guides/`, `concepts/`

2. Lis les pages identifiees et verifie leur coherence avec le code actuel.

**B. Scan large (coherence globale)**

3. Liste toutes les pages MDX dans `content/docs/` et effectue un audit rapide :
   - **Noms/references** : mentions de l'ancien nom de projet, anciens domaines, anciennes URLs
   - **Chemins de code** : references a des fichiers ou repertoires qui ont ete deplaces/renommes
   - **Variables d'environnement** : comparer les env vars documentees dans `self-hosting.mdx` avec celles definies dans `src/config.ts` — signaler les manquantes ou obsoletes
   - **Fonctionnalites supprimees ou deplacees** : pages documentant des features qui n'existent plus ou dont le scope a change (ex: feature deplacee sous licence EE)
   - **Liens internes** : references `(/doc/...)` pointant vers des pages qui n'existent plus

4. Fusionner les resultats des deux scans (A + B) et prioriser :
   - **Critique** : informations factuellement incorrectes, liens casses
   - **Important** : features/env vars non documentees, chemins obsoletes
   - **Mineur** : formulations a ajuster, precisions a ajouter

**C. Propositions**

5. Ne pas modifier le style, la mise en forme, ou ajouter de la documentation pour des details d'implementation interne (la doc content est destinee aux utilisateurs et operateurs, pas aux developpeurs).

6. Presente les modifications proposees par priorite et applique-les apres validation utilisateur.

## 6. ADR — Architecture Decision Records

Determine si les features implementees dans la session justifient un ou plusieurs nouveaux ADR. Un ADR est justifie si :
- Une **decision architecturale significative** a ete prise (nouveau pattern, nouvelle abstraction, choix technique structurant)
- La decision affecte la **structure du code** de maniere durable
- Il existe des **alternatives envisagees** qu'il est utile de documenter

Un ADR n'est PAS justifie pour :
- Un simple ajout de feature sans decision architecturale (ex: nouvelle page CRUD)
- Un bugfix
- Un refactoring mineur
- Des decisions purement visuelles/design (→ utiliser un DDR, etape 7)

Si un ADR est justifie :

1. Determine le prochain numero sequentiel en listant `docs/adr/` :
   ```bash
   ls docs/adr/*.md | sort | tail -1
   ```
2. Utilise le template `docs/adr/0000-template.md`
3. Redige l'ADR en francais avec les sections : Contexte, Decision, Options envisagees, Consequences, Liens
4. La date est celle du jour
5. Le statut est `Accepted`

Presente le contenu de l'ADR propose et cree le fichier apres validation utilisateur.

## 7. DDR — Design Decision Records

Les DDR sont l'equivalent des ADR pour les decisions de design system (palette, composants, patterns CSS, conventions visuelles). Ils vivent dans `docs/ddr/`.

### ADR vs DDR — comment choisir

| Critere | ADR (`docs/adr/`) | DDR (`docs/ddr/`) |
|---------|-------|-------|
| **Scope** | Architecture, patterns code, choix techniques | Palette, tokens CSS, composants UI, conventions visuelles |
| **Exemples** | Multi-tenant routing, auth flow, provider pattern | Palette oklch, conventions boutons, patterns bordures cartes |
| **Impact** | Structure du code, abstractions, data flow | Rendu visuel, coherence UI, accessibilite visuelle |
| **Template** | `docs/adr/0000-template.md` | `docs/ddr/0000-template.md` |

**Regle** : si la decision concerne **comment le code est structure**, c'est un ADR. Si elle concerne **comment l'interface se presente** (couleurs, espacements, variants de composants, dark mode), c'est un DDR. Certaines decisions chevauchent les deux (ex: architecture conditionnelle DSFR est un ADR pour le code, un DDR pour les tokens CSS) — dans ce cas, creer un DDR et y faire reference depuis les sections concernees.

### Quand creer un DDR

Un DDR est justifie si :
- Un **choix de palette, token, ou convention visuelle** a ete fait avec des alternatives envisagees
- Un **pattern de composant** est etabli (conventions de classes, hiérarchie de variants)
- Une **regle de design** est posee (ex: "zero shadow sur les boutons")
- Un **mecanisme UI** est introduit (ex: dark mode, theme switching)

Un DDR n'est PAS justifie pour :
- Un simple ajustement de padding ou couleur sans alternative envisagee
- L'ajout d'un composant sans convention nouvelle
- Un bugfix visuel

### Procedure

Si un DDR est justifie :

1. Determine le prochain numero sequentiel en listant `docs/ddr/` :
   ```bash
   ls docs/ddr/*.md | sort | tail -1
   ```
2. Utilise le template `docs/ddr/0000-template.md`
3. Redige le DDR en francais avec les sections : Contexte, Decision, Options envisagees, **Specifications** (tokens, composants, classes CSS), Consequences, Liens
4. La date est celle du jour
5. Le statut est `Accepted`

Presente le contenu du DDR propose et cree le fichier apres validation utilisateur.

## 8. Design System doc — Mise a jour

Le fichier `docs/design-system.md` est la **documentation combinee** du design system (theme "Default" / French Blue). C'est la reference interne pour les developpeurs — pas pour les utilisateurs finaux.

### Quand mettre a jour

Mettre a jour `docs/design-system.md` si les changements de la session touchent :
- La **palette** (tokens CSS dans `globals.scss`)
- Les **conventions de composants** (Button, Card, Badge, Header, Footer, etc.)
- La **typographie** ou les **patterns de layout**
- L'**architecture du theme** (dark mode, DSFR separation, ThemeInjector)
- Les **icones** (ajout, changement de convention de taille)
- Les **fichiers cles** du theme (nouveaux fichiers, renommages)

### Procedure

1. Lis `docs/design-system.md` et compare avec l'etat actuel du code (composants `packages/ui/src/components/`, `apps/web/src/app/globals.scss`, layouts)
2. Identifie les sections obsoletes ou incompletes
3. Propose les modifications necessaires
4. Applique apres validation utilisateur

**Regle** : `docs/design-system.md` doit toujours refleter l'etat actuel du code. Si un DDR est cree (etape 7), verifier que la section correspondante du design-system.md est coherente.

## 9. Resume

Affiche un resume final :

| Document | Action |
|---|---|
| CLAUDE.md | Modifie / Inchange |
| MEMORY.md | Modifie / Inchange |
| README.md | Modifie / Inchange |
| content/ | Modifie (pages) / Inchange |
| ADR | Cree (numero + titre) / Aucun nouveau |
| DDR | Cree (numero + titre) / Aucun nouveau |
| design-system.md | Modifie / Inchange |

Liste les fichiers modifies/crees avec un lien relatif.
