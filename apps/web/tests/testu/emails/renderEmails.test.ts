import {
  renderEmLinkConfirmEmail,
  renderInvitationEmail,
  renderMagicLinkEmail,
  renderResetPasswordEmail,
  renderVerifyEmailEmail,
} from "@/emails/renderEmails";

const baseProps = {
  baseUrl: "http://localhost:3000",
  translations: {
    title: "Test",
    body: "Body",
    button: "Click",
    expiry: "Expires soon",
    footer: "Footer",
    ignore: "Ignore",
  },
};

describe("renderEmails with theme parameter", () => {
  it("renderMagicLinkEmail accepts Default theme", async () => {
    const result = await renderMagicLinkEmail({ ...baseProps, theme: "Default", url: "http://test" });
    expect(typeof result).toBe("string");
  });

  it("renderMagicLinkEmail accepts Dsfr theme", async () => {
    const result = await renderMagicLinkEmail({ ...baseProps, theme: "Dsfr", url: "http://test" });
    expect(typeof result).toBe("string");
  });

  it("renderInvitationEmail accepts theme", async () => {
    const result = await renderInvitationEmail({ ...baseProps, theme: "Dsfr", invitationLink: "http://test" });
    expect(typeof result).toBe("string");
  });

  it("renderVerifyEmailEmail accepts theme", async () => {
    const result = await renderVerifyEmailEmail({ ...baseProps, theme: "Default", url: "http://test" });
    expect(typeof result).toBe("string");
  });

  it("renderResetPasswordEmail accepts theme", async () => {
    const result = await renderResetPasswordEmail({ ...baseProps, theme: "Default", url: "http://test" });
    expect(typeof result).toBe("string");
  });

  it("renderEmLinkConfirmEmail accepts theme", async () => {
    const result = await renderEmLinkConfirmEmail({
      ...baseProps,
      theme: "Dsfr",
      confirmUrl: "http://test",
      translations: { ...baseProps.translations, greeting: "Hi", closing: "Bye" },
    });
    expect(typeof result).toBe("string");
  });
});
