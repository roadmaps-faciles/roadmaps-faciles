import {
  boardCreated,
  boardPublicViewed,
  boardViewed,
  commentCreated,
  docsPageViewed,
  embedConfigured,
  embedViewed,
  integrationSynced,
  invitationAccepted,
  invitationSent,
  memberRoleChanged,
  moderationPostApproved,
  moderationPostRejected,
  postCreated,
  postFirstCreated,
  postStatusChanged,
  postViewed,
  tenantCreated,
  tenantDomainConfigured,
  tenantSettingsUpdated,
  TRACKING_EVENTS,
  type TrackingEventName,
  userFirstLogin,
  userSignedIn,
  userSignedUp,
  voteCast,
  voteFirstCast,
} from "@/lib/ee/tracking-provider/trackingPlan";

describe("trackingPlan", () => {
  describe("TRACKING_EVENTS registry", () => {
    it("contains exactly 25 event keys", () => {
      expect(Object.keys(TRACKING_EVENTS)).toHaveLength(25);
    });

    it("has keys matching the event names", () => {
      const expectedNames: TrackingEventName[] = [
        "docs.page_viewed",
        "board.public_viewed",
        "embed.viewed",
        "user.signed_up",
        "user.first_login",
        "tenant.created",
        "post.first_created",
        "vote.first_cast",
        "post.created",
        "post.viewed",
        "vote.cast",
        "comment.created",
        "post.status_changed",
        "board.viewed",
        "board.created",
        "integration.synced",
        "user.signed_in",
        "invitation.sent",
        "invitation.accepted",
        "tenant.domain_configured",
        "embed.configured",
        "moderation.post_approved",
        "moderation.post_rejected",
        "tenant.settings_updated",
        "member.role_changed",
      ];
      expect(Object.keys(TRACKING_EVENTS).sort()).toEqual(expectedNames.sort());
    });
  });

  describe("event factories", () => {
    it.each([
      { factory: docsPageViewed, name: "docs.page_viewed", props: { path: "/guide", section: "guides" } },
      { factory: boardPublicViewed, name: "board.public_viewed", props: { boardId: "1", tenantId: "2" } },
      {
        factory: embedViewed,
        name: "embed.viewed",
        props: { boardId: "1", tenantId: "2", referrer: "https://example.com" },
      },
      { factory: userSignedUp, name: "user.signed_up", props: { userId: "u1", method: "nodemailer" } },
      { factory: userFirstLogin, name: "user.first_login", props: { userId: "u1", method: "bridge" } },
      { factory: tenantCreated, name: "tenant.created", props: { tenantId: "1", subdomain: "acme" } },
      {
        factory: postFirstCreated,
        name: "post.first_created",
        props: { postId: "1", boardId: "2", tenantId: "3" },
      },
      { factory: voteFirstCast, name: "vote.first_cast", props: { postId: "1", tenantId: "2" } },
      {
        factory: postCreated,
        name: "post.created",
        props: { postId: "1", boardId: "2", tenantId: "3", isAnonymous: true },
      },
      { factory: postViewed, name: "post.viewed", props: { postId: "1", boardId: "2", tenantId: "3" } },
      { factory: voteCast, name: "vote.cast", props: { postId: "1", tenantId: "2" } },
      {
        factory: commentCreated,
        name: "comment.created",
        props: { postId: "1", tenantId: "2", isReply: false },
      },
      {
        factory: postStatusChanged,
        name: "post.status_changed",
        props: { postId: "1", tenantId: "2", oldStatus: "new", newStatus: "in_progress" },
      },
      { factory: boardViewed, name: "board.viewed", props: { boardId: "1", tenantId: "2" } },
      { factory: boardCreated, name: "board.created", props: { boardId: "1", tenantId: "2" } },
      { factory: userSignedIn, name: "user.signed_in", props: { userId: "u1", method: "github" } },
      { factory: invitationSent, name: "invitation.sent", props: { tenantId: "1", role: "USER" } },
      { factory: invitationAccepted, name: "invitation.accepted", props: { tenantId: "1", userId: "u1" } },
      {
        factory: tenantDomainConfigured,
        name: "tenant.domain_configured",
        props: { tenantId: "1", domain: "custom.example.com" },
      },
      { factory: embedConfigured, name: "embed.configured", props: { tenantId: "1" } },
      {
        factory: moderationPostApproved,
        name: "moderation.post_approved",
        props: { postId: "1", tenantId: "2" },
      },
      {
        factory: moderationPostRejected,
        name: "moderation.post_rejected",
        props: { postId: "1", tenantId: "2" },
      },
      {
        factory: tenantSettingsUpdated,
        name: "tenant.settings_updated",
        props: { tenantId: "1", setting: "general" },
      },
      {
        factory: memberRoleChanged,
        name: "member.role_changed",
        props: { tenantId: "1", userId: "u1", oldRole: "USER", newRole: "ADMIN" },
      },
      {
        factory: integrationSynced,
        name: "integration.synced",
        props: { integrationId: "1", tenantId: "2", synced: 5, errors: 1, conflicts: 0 },
      },
    ])("$name returns { name, properties }", ({ factory, name, props }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const event = factory(props as any);
      expect(event).toEqual({ name, properties: props });
    });
  });
});
