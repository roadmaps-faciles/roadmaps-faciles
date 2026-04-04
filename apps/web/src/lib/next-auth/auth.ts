import { PrismaAdapter } from "@auth/prisma-adapter";
import { EspaceMembreProvider, ESPACE_MEMBRE_PROVIDER_ID } from "@incubateur-ademe/next-auth-espace-membre-provider";
import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import NextAuth from "next-auth";
import { type AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { config } from "@/config";
import { getEmailTranslations } from "@/emails/getEmailTranslations";
import { renderMagicLinkEmail } from "@/emails/renderEmails";
import { verifyBridgeToken } from "@/lib/authBridge";
import { createMailTransporter } from "@/lib/mailer";
import { getDomainFromHost, getTenantSubdomain } from "@/lib/utils/tenant";
import { type UserRole, type UserStatus } from "@/prisma/enums";
import { type UiTheme } from "@/ui/types";
import { GetTenantSettings } from "@/useCases/tenant_settings/GetTenantSettings";
import { GetTenantForDomain } from "@/useCases/tenant/GetTenantForDomain";
import { type Locale } from "@/utils/i18n";

import { prisma } from "../db/prisma";
import { trackServerEvent } from "../ee/tracking-provider/serverTracking";
import { invitationAccepted, userFirstLogin, userSignedIn, userSignedUp } from "../ee/tracking-provider/trackingPlan";
import {
  appSettingsRepo,
  tenantDefaultOAuthRepo,
  tenantRepo,
  tenantSettingsRepo,
  userOnTenantRepo,
  userRepo,
} from "../repo";
import { refreshAccessToken } from "./refresh";
import { revalidateSessionUser } from "./revalidateSessionUser";

type CustomUser = {
  currentTenantRole?: UserRole;
  isBetaGouvMember: boolean;
  isSuperAdmin?: boolean;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  uuid: string;
} & AdapterUser;

declare module "next-auth" {
  interface Session {
    twoFactorDeadline?: string;
    twoFactorRequired: boolean;
    twoFactorVerified: boolean;
    user: CustomUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    provider?: string;
    refreshToken?: string;
    sessionRefreshAt?: number;
    twoFactorDeadline?: string;
    twoFactorRequired: boolean;
    twoFactorVerified: boolean;
    user: CustomUser;
  }
}

const espaceMembreProvider = EspaceMembreProvider({
  fetch,
  fetchOptions: {
    next: {
      revalidate: 300, // 5 minutes
    },
    cache: "default",
  },
});

const nodemailerProvider = Nodemailer({
  server: {
    host: config.mailer.host,
    port: config.mailer.smtp.port,
    auth: {
      user: config.mailer.smtp.login,
      pass: config.mailer.smtp.password,
    },
  },
  from: config.mailer.from,
  async sendVerificationRequest({ identifier, url, provider }) {
    const cookieStore = await cookies();
    const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "fr";

    let theme: UiTheme = "Default";
    try {
      const domain = await getDomainFromHost();
      if (getTenantSubdomain(domain)) {
        const tenant = await new GetTenantForDomain(tenantRepo).execute({ domain });
        const settings = await new GetTenantSettings(tenantSettingsRepo).execute({ tenantId: tenant.id });
        theme = settings.uiTheme;
      }
    } catch {
      // Fall back to Default on any resolution error
    }

    const [t, tFooter] = await Promise.all([
      getEmailTranslations(locale, "emails.magicLink", ["subject", "title", "body", "button", "expiry", "ignore"]),
      getEmailTranslations(locale, "emails", ["footer"]),
    ]);

    const html = await renderMagicLinkEmail({
      baseUrl: config.host,
      locale,
      theme,
      translations: { ...t, footer: tFooter.footer },
      url,
    });

    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: provider.from,
      to: identifier,
      subject: t.subject,
      html,
      text: `${t.body}\n\n${url}\n\n${t.expiry}`,
    });
  },
});

export interface GetAuthMethodsProps {
  domain?: string;
}

// Build OAuth providers conditionally based on config
function buildOAuthProviders() {
  const providers = [];

  if (config.oauth.github.clientId) {
    providers.push(
      GitHub({
        clientId: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        authorization: { params: { scope: "read:user user:email" } },
      }),
    );
  }

  if (config.oauth.google.clientId) {
    providers.push(
      Google({
        clientId: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        authorization: { params: { access_type: "offline", prompt: "consent" } },
      }),
    );
  }

  if (config.oauth.proconnect.clientId) {
    providers.push({
      id: "proconnect",
      name: "ProConnect",
      type: "oidc" as const,
      issuer: config.oauth.proconnect.issuer,
      clientId: config.oauth.proconnect.clientId,
      clientSecret: config.oauth.proconnect.clientSecret,
    });
  }

  return providers;
}

// Session sliding window: 30 minutes
const SESSION_MAX_AGE = 30 * 60 * 1000;

const {
  auth: authCore,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(async () => {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto");
  const rawHost = headersList.get("host");
  const host = rawHost?.startsWith("0.0.0.0") ? rawHost.replace("0.0.0.0", "localhost") : rawHost;
  const url = protocol && host ? `${protocol}://${host}/api/auth` : null;

  // Normalize additional root domains (e.g. Tailscale IP/DNS) and their subdomains
  let normalizedHost = host;
  if (host) {
    if (config.additionalRootDomains.includes(host)) {
      normalizedHost = config.rootDomain;
    } else {
      for (const altRoot of config.additionalRootDomains) {
        if (host.endsWith(`.${altRoot}`)) {
          const subdomain = host.slice(0, -(altRoot.length + 1));
          normalizedHost = `${subdomain}.${config.rootDomain}`;
          break;
        }
      }
    }
  }
  const isRootHost = protocol && normalizedHost && `${protocol}://${normalizedHost}` === config.host;
  const domain = isRootHost ? null : normalizedHost || null;
  const getTenantForDomain = new GetTenantForDomain(tenantRepo);
  const getTenantSettings = new GetTenantSettings(tenantSettingsRepo);

  const tenant = domain ? await getTenantForDomain.execute({ domain }) : null;
  const tenantSettings = tenant ? await getTenantSettings.execute({ tenantId: tenant.id }) : null;

  if (!url) {
    const { logger } = await import("../logger");
    logger.error("Invalid request url — protocol or host header missing");
    return { providers: [] };
  }

  return {
    secret: config.security.auth.secret,
    redirectProxyUrl: url,
    trustHost: true,
    pages: {
      signIn: "/login",
      signOut: "/logout",
      error: "/login/error",
      verifyRequest: "/login/verify-request",
    },
    session: {
      strategy: "jwt",
    },
    adapter: espaceMembreProvider.AdapterWrapper(PrismaAdapter(prisma)),
    providers: [
      nodemailerProvider,
      espaceMembreProvider.ProviderWrapper(nodemailerProvider),
      Credentials({
        id: "bridge",
        credentials: { token: { type: "text" } },
        async authorize(credentials) {
          const token = credentials?.token as string;
          if (!token) return null;
          try {
            const payload = verifyBridgeToken(token);
            const user = await userRepo.findById(payload.userId);
            if (!user || user.status === "DELETED") return null;
            return { id: user.id, email: user.email, name: user.name };
          } catch {
            return null;
          }
        },
      }),
      Credentials({
        id: "password",
        credentials: {
          email: { type: "email" },
          password: { type: "password" },
        },
        async authorize(credentials) {
          const email = credentials?.email as string;
          const password = credentials?.password as string;
          if (!email || !password) return null;

          const user = await userRepo.findByEmail(email);
          if (!user || !user.passwordHash || user.status === "DELETED" || user.status === "BLOCKED") return null;
          if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

          const { verifyPassword } = await import("@/lib/utils/password");
          const valid = await verifyPassword(user.passwordHash, password);
          if (!valid) return null;

          return { id: user.id, email: user.email, name: user.name };
        },
      }),
      ...buildOAuthProviders(),
    ],
    callbacks: espaceMembreProvider.CallbacksWrapper({
      redirect({ url }) {
        const fallback = `${protocol}://${host}/`;

        if (url.startsWith("/")) return `${protocol}://${host}${url}`;

        try {
          const parsed = new URL(url);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fallback;

          const rootHost = new URL(config.host).host;
          if (
            parsed.host === rootHost ||
            parsed.host.endsWith(`.${config.rootDomain}`) ||
            config.additionalRootDomains.some(alt => parsed.host === alt || parsed.host.endsWith(`.${alt}`))
          ) {
            return url;
          }
        } catch {
          // invalid URL — fall through
        }

        return fallback;
      },
      async signIn(params) {
        // Pre-login OTP check: block magic link if user has OTP configured but no pre-login proof
        const isEmailProvider =
          params.account?.provider === "nodemailer" || params.account?.provider === ESPACE_MEMBRE_PROVIDER_ID;
        if (isEmailProvider && params.email?.verificationRequest) {
          // For EM provider, user.email has been resolved by the wrapper (real email, not username)
          // Lookup user to check OTP configuration
          const email = params.user.email;
          if (email) {
            const otpUser = await prisma.user.findFirst({
              where: { email },
              select: { id: true, otpSecret: true, otpVerifiedAt: true },
            });
            if (otpUser?.otpSecret && otpUser.otpVerifiedAt) {
              // User has OTP configured — require pre-login proof
              const { redis } = await import("../db/redis/storage");
              const proof = await redis.getItem<string>(`otp:pre-login:${otpUser.id}`);
              if (!proof) {
                return false; // Block magic link — no OTP proof
              }
              // Don't consume proof here — consumed in JWT callback on signIn
            }
          }
        }

        if (params.account?.provider === "nodemailer" && params.email?.verificationRequest) {
          // Phase 1: User entered email — decide if we send the verification email
          if (!params.user.email || !tenantSettings || !tenant) {
            return false;
          }
          const [possibleUsername, emailDomain] = params.user.email.split("@");
          if (!emailDomain) {
            return false;
          }

          // Check for pending invitation — bypasses emailRegistrationPolicy
          const pendingInvitation = await prisma.invitation.findFirst({
            where: { email: params.user.email, tenantId: tenant.id, acceptedAt: null },
          });

          if (!pendingInvitation) {
            // No invitation — apply emailRegistrationPolicy
            if (tenantSettings.emailRegistrationPolicy === "NOONE") {
              return false;
            }

            if (tenantSettings.emailRegistrationPolicy === "DOMAINS") {
              const isAllowedDomain =
                tenantSettings.allowedEmailDomains.includes(emailDomain) ||
                tenantSettings.allowedEmailDomains.includes("*") ||
                tenantSettings.allowedEmailDomains.length === 0;

              if (!isAllowedDomain) {
                return false;
              }
            }
            // ANYONE — falls through
          }

          if (params.user.email?.endsWith("@beta.gouv.fr") || params.user.email?.endsWith("@ext.beta.gouv.fr")) {
            // check if user is found in espace membre, if not, block connection
            // if found but account not found in db, create it with isBetaGouvMember = true
            try {
              const betaUser = await espaceMembreProvider.client.member.getByUsername(possibleUsername);
              if (!betaUser.isActive) {
                return false;
              }

              const dbUser = await userRepo.findByEmail(params.user.email);
              if (!dbUser) {
                params.user = await userRepo.create({
                  email: params.user.email,
                  name: betaUser.fullname,
                  username: betaUser.username,
                  image: betaUser.avatar,
                  isBetaGouvMember: true,
                  role: "USER",
                  status: "ACTIVE",
                });
              } else {
                let userInTenant = await userOnTenantRepo.findMembership(dbUser.id, tenant.id);
                if (!userInTenant) {
                  userInTenant = await userOnTenantRepo.create({
                    userId: dbUser.id,
                    tenantId: tenant.id,
                    role: "INHERITED",
                    status: "ACTIVE",
                  });
                }

                params.user = dbUser;
              }
            } catch (error: unknown) {
              if (error instanceof EspaceMembreClientMemberNotFoundError) {
                return true;
              }
              return false;
            }
          }
        }

        // OAuth provider on tenant — verify it's enabled for this tenant
        if (
          (params.account?.type === "oauth" || params.account?.type === "oidc") &&
          tenant &&
          params.account.provider !== "nodemailer"
        ) {
          const enabledProviders = await tenantDefaultOAuthRepo.findByTenantId(tenant.id);
          if (!enabledProviders.some(p => p.provider === params.account!.provider)) {
            return false; // Provider not enabled for this tenant
          }

          // Auto-create UserOnTenant membership if needed
          const userId = params.user.id;
          if (userId) {
            const existing = await userOnTenantRepo.findMembership(userId, tenant.id);
            if (!existing) {
              await userOnTenantRepo.create({
                userId,
                tenantId: tenant.id,
                role: "INHERITED",
                status: "ACTIVE",
              });
            }
          }
        }

        // OAuth on root domain — check root provider settings
        if (
          (params.account?.type === "oauth" || params.account?.type === "oidc") &&
          !tenant &&
          params.account.provider !== "nodemailer"
        ) {
          const { getRootOAuthProviders } = await import("@/lib/utils/rootOAuthProviders");
          const rootProviders = await getRootOAuthProviders();
          const providerKey = params.account.provider as keyof typeof rootProviders;
          if (!(providerKey in rootProviders) || !rootProviders[providerKey]) {
            return false;
          }
        }

        // Bridge provider — only create membership on explicit signup (bridge_signup=1)
        if (params.account?.provider === "bridge" && tenant) {
          const userId = params.user.id;
          if (userId) {
            const existing = await userOnTenantRepo.findMembership(userId, tenant.id);
            if (!existing) {
              // Check if this is an explicit signup (from bridge with action=signup)
              // The bridge_signup flag is passed as a query param on the redirect URL,
              // which is the callbackUrl. We check it here via the URL search params.
              const callbackUrl = (params as Record<string, unknown>).callbackUrl as string | undefined;
              const isSignup =
                callbackUrl && new URL(callbackUrl, "http://localhost").searchParams.get("bridge_signup") === "1";
              if (isSignup) {
                await userOnTenantRepo.create({
                  userId,
                  tenantId: tenant.id,
                  role: "INHERITED",
                  status: "ACTIVE",
                });
              } else {
                // Not a member and not a signup — block sign-in
                return false;
              }
            }
          }
        }

        // Phase 2: Magic link clicked — handle invitation acceptance
        if (params.account?.provider === "nodemailer" && !params.email?.verificationRequest && tenant) {
          const email = params.user.email;
          if (email) {
            // Find the invitation to get its role before marking as accepted
            const invitation = await prisma.invitation.findFirst({
              where: { email, tenantId: tenant.id, acceptedAt: null },
              select: { role: true },
            });

            if (invitation) {
              // Mark as accepted
              await prisma.invitation.updateMany({
                where: { email, tenantId: tenant.id, acceptedAt: null },
                data: { acceptedAt: new Date() },
              });

              // Create UserOnTenant membership if not exists
              const userId = params.user.id;
              if (userId) {
                const existingMembership = await userOnTenantRepo.findMembership(userId, tenant.id);
                if (!existingMembership) {
                  await userOnTenantRepo.create({
                    userId,
                    tenantId: tenant.id,
                    role: invitation.role,
                    status: "ACTIVE",
                  });
                }
                void trackServerEvent(userId, invitationAccepted({ tenantId: String(tenant.id), userId }));
              }
            }
          }
        }

        return true;
      },
      async jwt({ token, trigger, account, espaceMembreMember }) {
        // Handle client-side session.update() calls for 2FA verification
        if (trigger === "update") {
          // Re-validate user before accepting update (block deleted/blocked users)
          if (token.user) {
            const revalidated = await revalidateSessionUser(
              token.user,
              userRepo.findById.bind(userRepo),
              config.admins,
            );
            if (revalidated === null) {
              return { ...token, user: undefined as unknown as CustomUser };
            }
            if (revalidated !== undefined) {
              token.user = { ...token.user, ...revalidated };
            }
          }
          // Validate server-side proof before marking as verified
          const { redis } = await import("../db/redis/storage");
          const userId = token.user?.uuid;
          if (userId) {
            const proof = await redis.getItem<string>(`2fa:proof:${userId}`);
            if (proof) {
              await redis.removeItem(`2fa:proof:${userId}`);
              token.twoFactorVerified = true;
            }
          }
          return token;
        }

        if (trigger === "signIn" || !token.user) {
          const now = new Date();
          const dbUser = espaceMembreMember
            ? await userRepo.findByUsername(espaceMembreMember.username)
            : await userRepo.findByEmail(token.email!);

          if (!dbUser) {
            throw new Error("User not found in database");
          }

          // Determine if 2FA is required for this context
          let twoFactorRequired = false;
          let graceDays = 0;
          if (dbUser.twoFactorEnabled) {
            twoFactorRequired = true;
          } else {
            // Check force 2FA settings
            if (tenant && tenantSettings?.force2FA) {
              twoFactorRequired = true;
              graceDays = tenantSettings.force2FAGraceDays;
            }
            if (!tenant) {
              const appSettings = await appSettingsRepo.get();
              if (appSettings.force2FA) {
                twoFactorRequired = true;
                graceDays = appSettings.force2FAGraceDays;
              }
            }
          }

          // Handle grace period for forced 2FA (only for users without 2FA enabled)
          let twoFactorDeadline: string | undefined;
          if (twoFactorRequired && !dbUser.twoFactorEnabled && graceDays > 0) {
            if (!dbUser.twoFactorDeadline) {
              // Set deadline for the first time
              const deadline = new Date();
              deadline.setDate(deadline.getDate() + graceDays);
              await userRepo.update(dbUser.id, { twoFactorDeadline: deadline });
              twoFactorDeadline = deadline.toISOString();
            } else {
              twoFactorDeadline = dbUser.twoFactorDeadline.toISOString();
            }

            // If within grace period, don't require 2FA yet
            if (twoFactorDeadline && new Date(twoFactorDeadline) > now) {
              twoFactorRequired = false;
            }
          }

          // Check for pre-login OTP proof — if present, mark 2FA as already verified
          let preLoginOtpVerified = false;
          if (twoFactorRequired && dbUser.twoFactorEnabled) {
            const { redis } = await import("../db/redis/storage");
            const preLoginProof = await redis.getItem<string>(`otp:pre-login:${dbUser.id}`);
            if (preLoginProof) {
              await redis.removeItem(`otp:pre-login:${dbUser.id}`);
              preLoginOtpVerified = true;
            }
          }

          token = {
            ...token,
            twoFactorDeadline,
            twoFactorVerified: !twoFactorRequired || preLoginOtpVerified,
            twoFactorRequired,
            user: {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              emailVerified: now,
              username: dbUser.username!,
              image: dbUser.image,
              isSuperAdmin: dbUser.username ? config.admins.includes(dbUser.username) : false,
              uuid: dbUser.id,
              isBetaGouvMember: dbUser.isBetaGouvMember,
              role: dbUser.role,
              status: dbUser.status,
              twoFactorEnabled: dbUser.twoFactorEnabled,
            },
          };
          token.sub = dbUser.username || dbUser.id;

          // Store OAuth tokens for refresh
          if (account && (account.type === "oauth" || account.type === "oidc")) {
            token.accessToken = account.access_token ?? undefined;
            token.refreshToken = account.refresh_token ?? undefined;
            token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
            token.provider = account.provider;
          }

          // Set session sliding window
          token.sessionRefreshAt = Date.now() + SESSION_MAX_AGE;

          if (trigger === "signIn") {
            const method = account?.provider ?? "unknown";
            if (dbUser.signInCount === 0) {
              void trackServerEvent(dbUser.id, userSignedUp({ userId: dbUser.id, method }));
              void trackServerEvent(dbUser.id, userFirstLogin({ userId: dbUser.id, method }));
            }
            void trackServerEvent(dbUser.id, userSignedIn({ userId: dbUser.id, method }));
            await userRepo.update(dbUser.id, {
              signInCount: dbUser.signInCount + 1,
              lastSignInAt: dbUser.currentSignInAt ?? now,
              currentSignInAt: now,
            });
          }
        }

        // Refresh OAuth access token if expired
        if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
          token = await refreshAccessToken(token);
        }

        // User re-validation on every request (SELECT by PK, <1ms)
        const revalidated = await revalidateSessionUser(token.user, userRepo.findById.bind(userRepo), config.admins);
        if (revalidated === null) {
          return { ...token, user: undefined as unknown as CustomUser };
        }
        if (revalidated !== undefined) {
          token.user = { ...token.user, ...revalidated };
        }

        // Sliding window session refresh
        if (token.sessionRefreshAt && Date.now() > token.sessionRefreshAt) {
          token.sessionRefreshAt = Date.now() + SESSION_MAX_AGE;
        }

        // Resolve current tenant role on every request
        if (token.user && tenant) {
          const membership = await userOnTenantRepo.findMembership(token.user.uuid, tenant.id);
          token.user = { ...token.user, currentTenantRole: membership?.role ?? undefined };
        } else if (token.user) {
          token.user = { ...token.user, currentTenantRole: undefined };
        }

        return token;
      },
      session({ session, token }) {
        session.user = token.user;
        session.twoFactorVerified = token.twoFactorVerified;
        session.twoFactorRequired = token.twoFactorRequired;
        session.twoFactorDeadline = token.twoFactorDeadline;
        return session;
      },
    }),
  };
});

// Wrap auth with React.cache() for per-request deduplication
// This prevents multiple calls to auth() in the same request from executing multiple times
export const auth = cache(authCore);

// Re-export other auth functions
export { signIn, signOut, GET, POST };
