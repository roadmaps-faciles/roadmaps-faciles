import { ensureApiEnvVar, ensureEnvVar } from "@/utils/os";
import { isTruthy } from "@/utils/string";

// Variables publiques exposées au navigateur AU RUNTIME via window.__PUBLIC_CONFIG__
// (injecté par PublicConfigScript avant l'hydratation, cf src/app/PublicConfigScript.tsx).
// Lues côté serveur dans process.env au runtime. Permet à l'image prébuildée de servir
// n'importe quel domaine / branding / mentions légales sans rebuild.
export const PUBLIC_ENV_KEYS = [
  "SITE_URL",
  "REPOSITORY_URL",
  "MATOMO_URL",
  "MATOMO_SITE_ID",
  "TRACKING_PROVIDER",
  "POSTHOG_KEY",
  "POSTHOG_HOST",
  "BRAND_NAME",
  "BRAND_TAGLINE",
  "BRAND_MINISTRY",
  "BRAND_OPERATOR_ENABLE",
  "BRAND_OPERATOR_LOGO_URL",
  "BRAND_OPERATOR_LOGO_ALT",
  "BRAND_OPERATOR_LOGO_ORIENTATION",
  "LEGAL_PUBLISHER_NAME",
  "LEGAL_PUBLISHER_ADDRESS",
  "LEGAL_PUBLICATION_DIRECTOR",
  "LEGAL_HOSTING_NAME",
  "LEGAL_HOSTING_ADDRESS",
  "LEGAL_HOSTING_CONTACT",
  "LEGAL_HOSTING_PRIVACY_URL",
  "LEGAL_CONTACT_EMAIL",
  "LEGAL_RGPD_EMAIL",
] as const;

type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];

declare global {
  interface Window {
    __PUBLIC_CONFIG__?: Partial<Record<PublicEnvKey, string>>;
  }
}

// Lecture isomorphique : navigateur → window.__PUBLIC_CONFIG__, serveur → process.env (runtime).
// L'accès dynamique `process.env[key]` est volontaire : il empêche l'inlining build-time de Next
// (seul `process.env.NEXT_PUBLIC_X` littéral est inliné), donc la valeur reste runtime côté serveur.
const isoEnv = (key: PublicEnvKey): string | undefined =>
  typeof window !== "undefined" ? window.__PUBLIC_CONFIG__?.[key] : process.env[key];

// Snapshot des valeurs publiques pour sérialisation dans window (appelé côté serveur uniquement).
export const getPublicEnv = (): Partial<Record<PublicEnvKey, string>> => {
  const out: Partial<Record<PublicEnvKey, string>> = {};
  for (const key of PUBLIC_ENV_KEYS) {
    const value = process.env[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
};

export const config = {
  env: ensureApiEnvVar<"dev" | "prod" | "review" | "staging">(process.env.APP_ENV, "dev"),
  _seeding: ensureApiEnvVar(process.env._SEEDING, isTruthy, false),
  _dbUrl: ensureApiEnvVar(process.env.DATABASE_URL, ""),
  seed: {
    adminName: ensureApiEnvVar(process.env.SEED_ADMIN_NAME, "Admin"),
    adminEmail: ensureApiEnvVar(process.env.SEED_ADMIN_EMAIL, "admin@example.com"),
    adminPassword: ensureApiEnvVar(process.env.SEED_ADMIN_PASSWORD, ""),
    adminImage: ensureApiEnvVar(process.env.SEED_ADMIN_IMAGE, ""),
    adminUsername: ensureApiEnvVar(process.env.SEED_ADMIN_USERNAME, "admin"),
    minimal: ensureApiEnvVar(process.env.SEED_MINIMAL, isTruthy, false),
    tenantName: ensureApiEnvVar(process.env.SEED_TENANT_NAME, "Le Site par Défaut"),
    tenantSubdomain: ensureApiEnvVar(process.env.SEED_TENANT_SUBDOMAIN, "default"),
    minFakeUsers: ensureApiEnvVar(process.env.SEED_MIN_FAKE_USERS, Number, 8),
    maxFakeUsers: ensureApiEnvVar(process.env.SEED_MAX_FAKE_USERS, Number, 16),
    minFakePosts: ensureApiEnvVar(process.env.SEED_MIN_FAKE_POSTS, Number, 64),
    maxFakePosts: ensureApiEnvVar(process.env.SEED_MAX_FAKE_POSTS, Number, 256),
    maxFakeLikesPerPost: ensureApiEnvVar(process.env.SEED_MAX_FAKE_LIKES_PER_POST, Number, 128),
    maxFakeCommentsPerPost: ensureApiEnvVar(process.env.SEED_MAX_FAKE_COMMENTS_PER_POST, Number, 16),
    maxRepliesPerComment: ensureApiEnvVar(process.env.SEED_MAX_REPLIES_PER_COMMENT, Number, 8),
    bulk: ensureApiEnvVar(process.env.SEED_BULK, isTruthy, false),
    bulkOrgs: ensureApiEnvVar(process.env.SEED_BULK_ORGS, Number, 5),
    bulkTenantsPerOrg: ensureApiEnvVar(process.env.SEED_BULK_TENANTS_PER_ORG, Number, 3),
    bulkSharedUsers: ensureApiEnvVar(process.env.SEED_BULK_SHARED_USERS, Number, 30),
    bulkMinPostsPerTenant: ensureApiEnvVar(process.env.SEED_BULK_MIN_POSTS, Number, 30),
    bulkMaxPostsPerTenant: ensureApiEnvVar(process.env.SEED_BULK_MAX_POSTS, Number, 80),
  },
  maintenance: ensureApiEnvVar(process.env.MAINTENANCE_MODE, isTruthy, false),
  platformDomain: ensureApiEnvVar(process.env.PLATFORM_DOMAIN, ""),
  host: ensureEnvVar(isoEnv("SITE_URL"), "http://localhost:3000"),
  get rootDomain() {
    return this.host.replace(/^(https?:\/\/)?(www\.)?/, "");
  },
  additionalRootDomains: ensureApiEnvVar(
    process.env.ADDITIONAL_ROOT_DOMAINS,
    v =>
      v
        .split(",")
        .map(d => d.trim())
        .filter(Boolean),
    [] as string[],
  ),
  appVersion: ensureEnvVar(process.env.NEXT_PUBLIC_APP_VERSION, "dev"),
  appVersionCommit: ensureEnvVar(process.env.NEXT_PUBLIC_APP_VERSION_COMMIT, "unknown"),
  // Tag GHCR utilisé pour pull l'image. Mouvant (branch name suit les pushs), mais
  // l'image elle-même est immutable et identifiable via appVersionCommit (sha git).
  // process.env (pas NEXT_PUBLIC) parce que server-only, lu au runtime depuis l'ENV du
  // stage runner du Dockerfile (cf ARG IMAGE_REF + ENV IMAGE_REF dans Dockerfile).
  imageRef: ensureApiEnvVar(process.env.IMAGE_REF, "unknown"),
  repositoryUrl: ensureEnvVar(isoEnv("REPOSITORY_URL"), "https://github.com/roadmaps-faciles/roadmaps-faciles"),
  matomo: {
    url: ensureEnvVar(isoEnv("MATOMO_URL"), ""),
    siteId: ensureEnvVar(isoEnv("MATOMO_SITE_ID"), ""),
  },
  tracking: {
    provider: ensureEnvVar<"matomo" | "memory" | "noop" | "posthog">(isoEnv("TRACKING_PROVIDER"), "noop"),
    posthogKey: ensureEnvVar(isoEnv("POSTHOG_KEY"), ""),
    posthogHost: ensureEnvVar(isoEnv("POSTHOG_HOST"), "https://eu.i.posthog.com"),
  },
  admins: ensureApiEnvVar(
    process.env.ADMINS,
    v =>
      v
        .trim()
        .split(",")
        .map(a => a.trim())
        .filter(Boolean),
    ["lilian.sagetlethias", "julien.bouqillon"],
  ),
  brand: {
    name: ensureEnvVar(isoEnv("BRAND_NAME"), "Roadmaps Faciles"),
    tagline: ensureEnvVar(isoEnv("BRAND_TAGLINE"), "Du feedback mutuel à la roadmap partagée, facilement"),
    ministry: ensureEnvVar(isoEnv("BRAND_MINISTRY"), "République\nFrançaise"),
    operator: {
      enable: ensureEnvVar(isoEnv("BRAND_OPERATOR_ENABLE"), isTruthy, true),
      logo: {
        imgUrl: ensureEnvVar(isoEnv("BRAND_OPERATOR_LOGO_URL"), "/img/roadmaps-faciles.png"),
        alt: ensureEnvVar(isoEnv("BRAND_OPERATOR_LOGO_ALT"), "Roadmaps Faciles"),
        orientation: ensureEnvVar<"horizontal" | "vertical">(isoEnv("BRAND_OPERATOR_LOGO_ORIENTATION"), "vertical"),
      },
    },
  },
  legal: {
    publisherName: ensureEnvVar(isoEnv("LEGAL_PUBLISHER_NAME"), "Roadmaps Faciles"),
    publisherAddress: ensureEnvVar(isoEnv("LEGAL_PUBLISHER_ADDRESS"), ""),
    publicationDirector: ensureEnvVar(isoEnv("LEGAL_PUBLICATION_DIRECTOR"), "Le responsable légal de Roadmaps Faciles"),
    hostingName: ensureEnvVar(isoEnv("LEGAL_HOSTING_NAME"), "Scalingo SAS"),
    hostingAddress: ensureEnvVar(isoEnv("LEGAL_HOSTING_ADDRESS"), "15 avenue du Rhin, 67100 Strasbourg, France"),
    hostingContact: ensureEnvVar(isoEnv("LEGAL_HOSTING_CONTACT"), "support@scalingo.com"),
    hostingPrivacyUrl: ensureEnvVar(
      isoEnv("LEGAL_HOSTING_PRIVACY_URL"),
      "https://scalingo.com/fr/contrat-gestion-traitements-donnees-personnelles",
    ),
    contactEmail: ensureEnvVar(isoEnv("LEGAL_CONTACT_EMAIL"), "contact@roadmaps-faciles.fr"),
    rgpdEmail: ensureEnvVar(isoEnv("LEGAL_RGPD_EMAIL"), "rgpd@roadmaps-faciles.fr"),
  },
  mailer: {
    host: ensureApiEnvVar(process.env.MAILER_SMTP_HOST, "127.0.0.1"),
    smtp: {
      port: ensureApiEnvVar(process.env.MAILER_SMTP_PORT, Number, 1025),
      password: ensureApiEnvVar(process.env.MAILER_SMTP_PASSWORD, ""),
      login: ensureApiEnvVar(process.env.MAILER_SMTP_LOGIN, ""),
      ssl: ensureApiEnvVar(process.env.MAILER_SMTP_SSL, isTruthy, false),
    },
    get from() {
      const explicit = ensureApiEnvVar(process.env.MAILER_FROM_EMAIL, "");
      if (explicit) return explicit;
      // Pas de from par défaut lié à une marque tierce : casserait SPF/DMARC en self-host.
      if (this.smtp.login) return this.smtp.login;
      const host = ensureEnvVar(isoEnv("SITE_URL"), "http://localhost:3000")
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .replace(/:\d+$/, "");
      return `noreply@${host}`;
    },
  },
  oauth: {
    github: {
      clientId: ensureApiEnvVar(process.env.OAUTH_GITHUB_CLIENT_ID, ""),
      clientSecret: ensureApiEnvVar(process.env.OAUTH_GITHUB_CLIENT_SECRET, ""),
    },
    google: {
      clientId: ensureApiEnvVar(process.env.OAUTH_GOOGLE_CLIENT_ID, ""),
      clientSecret: ensureApiEnvVar(process.env.OAUTH_GOOGLE_CLIENT_SECRET, ""),
    },
    proconnect: {
      clientId: ensureApiEnvVar(process.env.OAUTH_PROCONNECT_CLIENT_ID, ""),
      clientSecret: ensureApiEnvVar(process.env.OAUTH_PROCONNECT_CLIENT_SECRET, ""),
      issuer: ensureApiEnvVar(process.env.OAUTH_PROCONNECT_ISSUER, ""),
    },
  },
  security: {
    auth: {
      secret: ensureApiEnvVar(process.env.SECURITY_JWT_SECRET, "secret"),
    },
    webhook: {
      secret: ensureApiEnvVar(process.env.SECURITY_WEBHOOK_SECRET, "secret"),
    },
    setupToken: ensureApiEnvVar(process.env.SETUP_TOKEN, ""),
  },
  espaceMembre: {
    apiKey: ensureApiEnvVar(process.env.ESPACE_MEMBRE_API_KEY, ""),
    url: ensureApiEnvVar(process.env.ESPACE_MEMBRE_URL, "https://espace-membre.incubateur.net"),
  },
  redis: {
    url: ensureApiEnvVar(process.env.REDIS_URL, ""),
    base: ensureApiEnvVar(process.env.REDIS_BASE, "roadmaps-faciles"),
    host: ensureApiEnvVar(process.env.REDIS_HOST, "localhost"),
    port: ensureApiEnvVar(process.env.REDIS_PORT, Number, 6379),
    tls: ensureApiEnvVar(process.env.REDIS_TLS, isTruthy, false),
    password: ensureApiEnvVar(process.env.REDIS_PASSWORD, ""),
  },
  domainProvider: {
    type: ensureApiEnvVar<"caddy" | "clevercloud" | "noop" | "scalingo-wildcard" | "scalingo">(
      process.env.DOMAIN_PROVIDER,
      "noop",
    ),
    scalingo: {
      apiToken: ensureApiEnvVar(process.env.DOMAIN_SCALINGO_API_TOKEN, ""),
      apiUrl: ensureApiEnvVar(process.env.DOMAIN_SCALINGO_API_URL, "https://api.osc-fr1.scalingo.com"),
      appId: ensureApiEnvVar(process.env.DOMAIN_SCALINGO_APP_ID, ""),
    },
    clevercloud: {
      consumerKey: ensureApiEnvVar(process.env.DOMAIN_CLEVERCLOUD_CONSUMER_KEY, ""),
      consumerSecret: ensureApiEnvVar(process.env.DOMAIN_CLEVERCLOUD_CONSUMER_SECRET, ""),
      token: ensureApiEnvVar(process.env.DOMAIN_CLEVERCLOUD_TOKEN, ""),
      tokenSecret: ensureApiEnvVar(process.env.DOMAIN_CLEVERCLOUD_TOKEN_SECRET, ""),
      appId: ensureApiEnvVar(process.env.DOMAIN_CLEVERCLOUD_APP_ID, ""),
    },
    caddy: {
      adminUrl: ensureApiEnvVar(process.env.DOMAIN_CADDY_ADMIN_URL, "http://localhost:2019"),
    },
  },
  observability: {
    sentryDsn: ensureEnvVar(process.env.NEXT_PUBLIC_SENTRY_DSN, ""),
    sentryServerDsn: ensureApiEnvVar(process.env.SENTRY_DSN, ""),
    sentryOrg: ensureApiEnvVar(process.env.SENTRY_ORG, ""),
    sentryProject: ensureApiEnvVar(process.env.SENTRY_PROJECT, ""),
    logLevel: ensureApiEnvVar<"debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn">(
      process.env.LOG_LEVEL,
      "debug",
    ),
    get sentryEnabled() {
      return !!(this.sentryDsn || this.sentryServerDsn);
    },
    get effectiveSentryDsn() {
      return this.sentryServerDsn || this.sentryDsn;
    },
  },
  storageProvider: {
    type: ensureApiEnvVar<"noop" | "s3">(process.env.STORAGE_PROVIDER, "noop"),
    maxFileSizeMb: ensureApiEnvVar(process.env.STORAGE_MAX_FILE_SIZE_MB, Number, 5),
    s3: {
      endpoint: ensureApiEnvVar(process.env.STORAGE_S3_ENDPOINT, ""),
      region: ensureApiEnvVar(process.env.STORAGE_S3_REGION, "us-east-1"),
      bucket: ensureApiEnvVar(process.env.STORAGE_S3_BUCKET, ""),
      accessKeyId: ensureApiEnvVar(process.env.STORAGE_S3_ACCESS_KEY_ID, ""),
      secretAccessKey: ensureApiEnvVar(process.env.STORAGE_S3_SECRET_ACCESS_KEY, ""),
      publicUrl: ensureApiEnvVar(process.env.STORAGE_S3_PUBLIC_URL, ""),
      keyPrefix: ensureApiEnvVar(process.env.STORAGE_S3_KEY_PREFIX, ""),
    },
  },
  dnsProvider: {
    type: ensureApiEnvVar<"cloudflare" | "manual" | "noop" | "ovh">(process.env.DNS_PROVIDER, "noop"),
    zoneName: ensureApiEnvVar(process.env.DNS_ZONE_NAME, ""),
    get target() {
      const target = ensureApiEnvVar(process.env.DNS_PROVIDER_TARGET, "")
        .replace("http://", "")
        .replace("https://", "");

      if (target.endsWith("/")) {
        return target.slice(0, -1);
      }
      if (!target.endsWith(".")) {
        return target + ".";
      }
      return target;
    },
    ovh: {
      endpoint: ensureApiEnvVar<"ovh-ca" | "ovh-eu">(process.env.DNS_OVH_ENDPOINT, "ovh-eu"),
      applicationKey: ensureApiEnvVar(process.env.DNS_OVH_APPLICATION_KEY, ""),
      applicationSecret: ensureApiEnvVar(process.env.DNS_OVH_APPLICATION_SECRET, ""),
      consumerKey: ensureApiEnvVar(process.env.DNS_OVH_CONSUMER_KEY, ""),
    },
    cloudflare: {
      email: ensureApiEnvVar(process.env.DNS_CLOUDFLARE_EMAIL, ""),
      apiKey: ensureApiEnvVar(process.env.DNS_CLOUDFLARE_API_KEY, ""),
    },
  },
  integrations: {
    encryptionKey: ensureApiEnvVar(process.env.INTEGRATION_ENCRYPTION_KEY, ""),
    cronManager: ensureApiEnvVar<"noop" | "route">(process.env.INTEGRATION_CRON_MANAGER, "noop"),
    cronSecret: ensureApiEnvVar(process.env.INTEGRATION_CRON_SECRET, ""),
    github: {
      appId: ensureApiEnvVar(process.env.GITHUB_APP_ID, ""),
      appPrivateKey: ensureApiEnvVar(
        process.env.GITHUB_APP_PRIVATE_KEY,
        v => Buffer.from(v, "base64").toString("utf-8"),
        "",
      ),
      appClientId: ensureApiEnvVar(process.env.GITHUB_APP_CLIENT_ID, ""),
      appClientSecret: ensureApiEnvVar(process.env.GITHUB_APP_CLIENT_SECRET, ""),
      appWebhookSecret: ensureApiEnvVar(process.env.GITHUB_APP_WEBHOOK_SECRET, ""),
      appName: ensureApiEnvVar(process.env.GITHUB_APP_NAME, "roadmaps-faciles"),
    },
  },
  domainVerification: {
    cronSecret: ensureApiEnvVar(process.env.DOMAIN_VERIFICATION_CRON_SECRET, ""),
    bypass: ensureApiEnvVar<string>(process.env.DOMAIN_VERIFICATION_BYPASS, "false") === "true",
  },
  stripe: {
    secretKey: ensureApiEnvVar(process.env.STRIPE_SECRET_KEY, ""),
    webhookSecret: ensureApiEnvVar(process.env.STRIPE_WEBHOOK_SECRET, ""),
  },
  licenseKey: ensureApiEnvVar(process.env.LICENSE_KEY, ""),
  licensingServerUrl: ensureApiEnvVar(process.env.LICENSING_SERVER_URL, "https://licensing.roadmaps-faciles.fr"),
  licensingAdminApiKey: ensureApiEnvVar(process.env.LICENSING_ADMIN_API_KEY, ""),
  instanceId: ensureApiEnvVar(process.env.INSTANCE_ID, ""),
} as const;

// {
//   "customDomain": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "multiTenant": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "integrations": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "apiWebhooks": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "auditCompliance": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "analytics": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "ssoEnterprise": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "bundlePro": { "monthly": "price_xxx", "yearly": "price_yyy" },
//   "bundleComplete": { "monthly": "price_xxx", "yearly": "price_yyy" }
// }
