/**
 * Tracking Plan — AARRI Pirate Metrics (Impact replaces Revenue for public service)
 *
 * Organized by customer lifecycle stage:
 *  1. Acquisition  — how users discover the platform
 *  2. Activation   — first value moment ("aha!")
 *  3. Engagement   — active usage depth
 *  4. Retention    — users come back (mostly computed from repeated events)
 *  5. Referral     — users bring others
 *  6. Impact       — value creation (replaces Revenue for public service)
 *
 * Convention: "entity.past_tense_verb" — e.g. "post.created", "user.signed_up"
 * Server-side events are marked with `server: true`.
 */

import { type TrackingEvent, type TrackingEventProperties } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────

type TypedTrackingEvent<P extends TrackingEventProperties> = TrackingEvent<P>;

function defineEvent<P extends TrackingEventProperties>(name: string, properties?: P): TypedTrackingEvent<P> {
  return { name, properties };
}

// ─── 1. Acquisition ──────────────────────────────────────────────────

/** Documentation page viewed (intent signal). */
export const docsPageViewed = (props: { path: string; section: string }) => defineEvent("docs.page_viewed", props);

/** Public board viewed without authentication (discovery). */
export const boardPublicViewed = (props: { boardId: string; tenantId: string }) =>
  defineEvent("board.public_viewed", props);

/** Embedded board viewed in an iframe (viral channel). */
export const embedViewed = (props: { boardId: string; referrer?: string; tenantId: string }) =>
  defineEvent("embed.viewed", props);

// ─── 2. Activation ──────────────────────────────────────────────────

/** Account created — server-side. */
export const userSignedUp = (props: { method: string; userId: string }) => defineEvent("user.signed_up", props);

/** User's very first login — server-side. */
export const userFirstLogin = (props: { method: string; userId: string }) => defineEvent("user.first_login", props);

/** Tenant created — server-side. */
export const tenantCreated = (props: { subdomain: string; tenantId: string }) => defineEvent("tenant.created", props);

/** User submitted their first feedback. */
export const postFirstCreated = (props: { boardId: string; postId: string; tenantId: string }) =>
  defineEvent("post.first_created", props);

/** User cast their first vote. */
export const voteFirstCast = (props: { postId: string; tenantId: string }) => defineEvent("vote.first_cast", props);

// ─── 3. Engagement ──────────────────────────────────────────────────

/** Post submitted. */
export const postCreated = (props: { boardId: string; isAnonymous: boolean; postId: string; tenantId: string }) =>
  defineEvent("post.created", props);

/** Post detail viewed. */
export const postViewed = (props: { boardId: string; postId: string; tenantId: string }) =>
  defineEvent("post.viewed", props);

/** Post upvoted/liked. */
export const voteCast = (props: { postId: string; tenantId: string }) => defineEvent("vote.cast", props);

/** Comment added. */
export const commentCreated = (props: { isReply: boolean; postId: string; tenantId: string }) =>
  defineEvent("comment.created", props);

/** Post status changed by admin/moderator — server-side. */
export const postStatusChanged = (props: { newStatus: string; oldStatus: string; postId: string; tenantId: string }) =>
  defineEvent("post.status_changed", props);

/** Board listing viewed. */
export const boardViewed = (props: { boardId: string; tenantId: string }) => defineEvent("board.viewed", props);

/** New board created — server-side. */
export const boardCreated = (props: { boardId: string; tenantId: string }) => defineEvent("board.created", props);

// ─── 4. Retention ────────────────────────────────────────────────────

/** User signed in (each login is a return signal) — server-side. */
export const userSignedIn = (props: { method: string; userId: string }) => defineEvent("user.signed_in", props);

// ─── 5. Referral ────────────────────────────────────────────────────

/** Invitation email sent — server-side. */
export const invitationSent = (props: { role: string; tenantId: string }) => defineEvent("invitation.sent", props);

/** Invitation accepted — server-side. */
export const invitationAccepted = (props: { tenantId: string; userId: string }) =>
  defineEvent("invitation.accepted", props);

/** Custom domain configured — server-side. */
export const tenantDomainConfigured = (props: { domain: string; tenantId: string }) =>
  defineEvent("tenant.domain_configured", props);

/** Embed enabled for a tenant — server-side. */
export const embedConfigured = (props: { tenantId: string }) => defineEvent("embed.configured", props);

// ─── 6. Impact (replaces Revenue) ───────────────────────────────────

/** Moderation: post approved — server-side. */
export const moderationPostApproved = (props: { postId: string; tenantId: string }) =>
  defineEvent("moderation.post_approved", props);

/** Moderation: post rejected — server-side. */
export const moderationPostRejected = (props: { postId: string; tenantId: string }) =>
  defineEvent("moderation.post_rejected", props);

/** Tenant settings updated — server-side. */
export const tenantSettingsUpdated = (props: { setting: string; tenantId: string }) =>
  defineEvent("tenant.settings_updated", props);

/** Admin changed a member's role — server-side. */
export const memberRoleChanged = (props: { newRole: string; oldRole: string; tenantId: string; userId: string }) =>
  defineEvent("member.role_changed", props);

/** Integration sync completed — server-side. */
export const integrationSynced = (props: {
  conflicts: number;
  errors: number;
  integrationId: string;
  synced: number;
  tenantId: string;
}) => defineEvent("integration.synced", props);

// ─── All event names (for type safety / autocomplete) ───────────────

export const TRACKING_EVENTS = {
  // Acquisition
  "docs.page_viewed": docsPageViewed,
  "board.public_viewed": boardPublicViewed,
  "embed.viewed": embedViewed,
  // Activation
  "user.signed_up": userSignedUp,
  "user.first_login": userFirstLogin,
  "tenant.created": tenantCreated,
  "post.first_created": postFirstCreated,
  "vote.first_cast": voteFirstCast,
  // Engagement
  "post.created": postCreated,
  "post.viewed": postViewed,
  "vote.cast": voteCast,
  "comment.created": commentCreated,
  "post.status_changed": postStatusChanged,
  "board.viewed": boardViewed,
  "board.created": boardCreated,
  "integration.synced": integrationSynced,
  // Retention
  "user.signed_in": userSignedIn,
  // Referral
  "invitation.sent": invitationSent,
  "invitation.accepted": invitationAccepted,
  "tenant.domain_configured": tenantDomainConfigured,
  "embed.configured": embedConfigured,
  // Impact
  "moderation.post_approved": moderationPostApproved,
  "moderation.post_rejected": moderationPostRejected,
  "tenant.settings_updated": tenantSettingsUpdated,
  "member.role_changed": memberRoleChanged,
} as const;

export type TrackingEventName = keyof typeof TRACKING_EVENTS;
