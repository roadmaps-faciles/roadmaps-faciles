# Licensing

Roadmaps Faciles uses a **triple license model**. Different parts of the codebase are covered by different licenses depending on their purpose.

## Quick summary

| License | Scope | What you can do |
|---------|-------|-----------------|
| **AGPL v3** | Core product | Use, modify, distribute freely - copyleft: modifications must be shared under the same license, including for network use (SaaS) |
| **Roadmaps Faciles Gov License** | DSFR theme & gov-specific code | Use, modify, distribute freely - production restricted to `.gouv.fr` domains and French public services |
| **BSL 1.1** | Premium add-ons (Enterprise Edition) | Read, modify, use in dev/test freely - production use requires a paid license. Converts to AGPL v3 after 4 years |

## How to identify which license applies

The license is determined by the **location** of the file in the repository:

- Files under `ee/` or `(ee)/` directories are licensed under **BSL 1.1**
- Files under `gouv/` or `(gouv)/` directories, plus `src/gouv/dsfr/` and `src/gouv/dsfr-bootstrap/`, are licensed under the **Roadmaps Faciles Gov License**
- Everything else is licensed under **AGPL v3**

Each `ee/` and `gouv/` directory contains a `LICENSE` symlink pointing to the root `LICENSE-EE` or `LICENSE-GOV` file. When in doubt, check the nearest `LICENSE` in the parent directory chain.

## AGPL v3 - Core (open source)

**Files:** everything not under `ee/`, `(ee)/`, `gouv/`, `(gouv)/`, `src/gouv/dsfr/`, or `src/gouv/dsfr-bootstrap/`
**License text:** [LICENSE](./LICENSE)

The core product is fully open source. You can self-host it, modify it, redistribute it, and use it commercially without any restrictions. This includes:

- Board, posts, votes, comments
- Basic authentication (email, magic link)
- Basic tenant administration
- Invitations, moderation, post approval
- Design system (shadcn/Radix via `packages/ui`)
- Theme switching abstraction (`src/ui/`)
- i18n (fr/en), dark mode, roadmap page
- Notifications, SSO bridge, feature flags
- Observability (Pino, Sentry integration)
- Documentation (Fumadocs)
- Email transport (Nodemailer)
- Redis caching

## Roadmaps Faciles Gov License - DSFR theme (source-available, `.gouv.fr` restricted)

**Files:** `src/gouv/dsfr/`, `src/gouv/dsfr-bootstrap/`, `src/emails/gouv/`, `src/lib/gouv/`, and any `(gouv)/` route groups
**License text:** see `LICENSE` files in the above directories

The DSFR theme implements the French government design system (Systeme de Design de l'Etat). It includes Marianne branding, government-specific components, ProConnect SSO, and the Espace Membre provider.

**You can:**
- Read, study, and modify the source code
- Use it in development and testing environments without restriction
- Redistribute modified versions under the same license
- Use it in production on `.gouv.fr` domains or services operated by/for French public administrations

**You cannot:**
- Use it in production on non-`.gouv.fr` domains or non-public-administration services

This restriction aligns with the [DSFR usage charter](https://www.systeme-de-design.gouv.fr/) which already restricts the use of Marianne branding and government design tokens to official government services.

> **Note:** This license is **not** OSI-approved. It is a source-available license with a usage restriction. The core product (AGPL v3) with the default shadcn theme is the fully open source alternative.

## BSL 1.1 - Enterprise Edition (source-available, commercial)

**Files:** all `ee/` and `(ee)/` directories
**License text:** see `LICENSE` files in the above directories

The Enterprise Edition contains premium add-ons that provide advanced functionality. The code is fully readable and modifiable.

**You can:**
- Read, study, and modify the source code
- Use it in development, testing, and staging environments without restriction
- Evaluate it for purchase decisions
- Contribute improvements back to the project

**You cannot:**
- Use it in production without a paid license from Roadmaps Faciles

**Automatic conversion:** BSL 1.1 code automatically converts to AGPL v3 four years after each version's release date. This means premium features eventually become fully open source.

### Enterprise add-ons

Each add-on is independently activable. You only pay for what you use.

| Add-on | Description |
|--------|-------------|
| Multi-tenant | Multi-tenant management, custom domains, DNS automation |
| SSO Enterprise | GitHub OAuth, Google OAuth |
| 2FA Enterprise | Passkey (WebAuthn), TOTP, email 2FA, force 2FA |
| Storage | S3 image uploads (BYOS supported for self-host) |
| Integrations | Notion sync, GitHub sync, Trello sync (marketplace planned) |
| Audit & Compliance | Advanced audit log with search, filters, export |
| Analytics | Tenant dashboards, root stats, usage analytics |
| SEO | Per-tenant sitemap/robots, indexation control |
| Embed | Iframe embeddable views, feedback widget SDK |
| Advanced editor | Rich markdown with image upload, emoji autocomplete |
| Webhooks | Outbound webhooks (Slack, Mattermost) |
| API Platform | API keys for users and tenants |
| MCP Server | Programmatic and AI interaction |
| Discussions | Discussion spaces per tenant |
| Chat | Chatwoot operator chat integration |
| Email branding | Custom email templates, custom SMTP domain |
| Priority support | SLA, dedicated channel |

## Self-hosting

Self-hosting the core product (AGPL v3) is free. If you modify the core and offer it as a network service, you must make your modifications available under AGPL v3. For self-hosted instances:

- **Documentation** is disabled and redirects to the hosted version at [TODO: doc URL]
- **Observability** is pluggable - bring your own Sentry instance and Pino transports
- **Storage** supports BYOS (Bring Your Own S3) - configure any S3-compatible endpoint
- **Prisma Studio** is available (direct DB access) - not available on cloud-managed instances
- **Telemetry** is opt-in and anonymized - helps us improve the product, can be fully disabled

Enterprise add-ons (BSL 1.1) can be used in development and testing for free. Production use requires a license.

## Contributing

Contributions are welcome to all parts of the codebase. By contributing, you agree that:

- Contributions to **AGPL v3** code are licensed under AGPL v3
- Contributions to **Gov License** code are licensed under the Roadmaps Faciles Gov License
- Contributions to **BSL 1.1** code are licensed under BSL 1.1

We may ask contributors to sign a CLA (Contributor License Agreement) to ensure we can maintain the licensing model.

## FAQ

**Q: Can I use the DSFR theme on a non-.gouv.fr domain?**
A: No. The DSFR theme is restricted to `.gouv.fr` domains and French public services. Use the default shadcn theme instead - it's fully open source and looks great.

**Q: Can I self-host with enterprise features for free?**
A: You can use enterprise features in dev/test for free. Production use requires a paid license, whether self-hosted or cloud-managed.

**Q: What happens after the BSL 4-year conversion?**
A: The specific version's enterprise code becomes AGPL v3 - fully open source, no restrictions. Newer versions may still be under BSL.

**Q: I'm a public administration but not on .gouv.fr, can I use the DSFR theme?**
A: If you operate a service for a French public administration (even on a non-.gouv.fr domain), contact us. The license covers services "operated by or for French public administrations."

**Q: Can I fork and remove the license checks?**
A: The license restrictions are legal, not just technical. Removing runtime checks does not change your license obligations. That said, we trust our users and focus on providing value rather than aggressive enforcement.

