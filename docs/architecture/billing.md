# Billing (Cloud)

Subscription billing Stripe par organisation. Code : `src/lib/ee/billing/`.

## Pack model

7 addon packs + 2 bundles définis dans `src/lib/model/Pricing.ts` :
- Pro 39€
- Complete 49€

18 Stripe Price IDs (test mode + prod mode) **hardcodés** dans `src/lib/ee/billing/pricing.ts`, **pas** en env vars (identifiants publics, pas des secrets).

## Checkout

`createMultiPackCheckoutSession()` :
- Supporte N packs en une seule session
- Auto-substitution en bundle quand la combinaison correspond
- Billing address
- TVA ID
- Acceptance CGV
- Promo codes

### Multi-interval

L'utilisateur peut mixer mensuel + annuel par pack, ce qui crée jusqu'à 2 subscriptions Stripe (une par interval). Flow de checkout séquentiel avec `autopay` au retour.

## Cart page

`/org/{slug}/checkout?items=pack1,pack2&interval=monthly` : toggle d'interval par item, incentives de bundle quand pertinent.

## Webhook

`handleCheckoutCompleted` :
- Lit la metadata `addons` (CSV) du checkout
- Crée les `OrgAddon` records avec `billingInterval` + `purchaseId`

## Restore purchases

`restorePurchases()` server action : Stripe est source of truth, synchronise les addons DB depuis les subscriptions actives. Utile quand un webhook a été manqué ou en cas de désynchronisation détectée.

### Desync detection

Comparaison server-side Stripe subscriptions vs DB addons. Si désync, banner warning sur la page billing avec CTA `restorePurchases()`.

## Dev tools

`DevToolsPanel` dans la sidebar :
- Toggle Stripe (cookie `dev-use-stripe`)
- Action "Clean Stripe" (destructive, dev-only guard)

### Dev checkout bypass

`/api/ee/billing/dev-checkout` simule un checkout sans appeler Stripe quand le toggle est off. Permet de tester le flow d'addon sans toucher le compte Stripe.
