import { type Meta, type StoryObj } from "@storybook/react-vite";

/**
 * Wireframes Stitch — Maquettes HTML statiques de référence pour l'implémentation.
 *
 * Chaque story affiche un écran Stitch dans un iframe plein page.
 * Le dark mode toggle est intégré dans chaque HTML (bouton flottant en bas à droite).
 *
 * Les fichiers HTML sont servis depuis `packages/ui/static/wireframes/`.
 */

function WireframeIframe({ file }: { file: string }) {
  return (
    <iframe
      src={`/wireframes/${file}.html`}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
      title={file}
    />
  );
}

type Story = StoryObj<typeof WireframeIframe>;

const meta: Meta = {
  title: "Wireframes",
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { disable: true },
    a11y: { disable: true },
    options: {
      showPanel: false,
    },
  },
};

export default meta;

// — Admin —

export const AdminAPIKeysListe: Story = {
  name: "API Keys & Webhooks — Liste",
  render: () => <WireframeIframe file="admin-auth-api-webhooks-1" />,
};

export const AdminAPIKeysDetail: Story = {
  name: "API Keys & Webhooks — Détail",
  render: () => <WireframeIframe file="admin-auth-api-webhooks-2" />,
};

export const AdminBoards: Story = {
  name: "Gestion des Boards",
  render: () => <WireframeIframe file="admin-boards-statuts-1" />,
};

export const AdminStatuts: Story = {
  name: "Gestion des Statuts",
  render: () => <WireframeIframe file="admin-boards-statuts-2" />,
};

export const AdminIntegrationsCatalogue: Story = {
  name: "Intégrations — Catalogue",
  render: () => <WireframeIframe file="admin-integrations-notion-1" />,
};

export const AdminIntegrationsWizard: Story = {
  name: "Intégrations — Wizard Config",
  render: () => <WireframeIframe file="admin-integrations-notion-2" />,
};

export const AdminIntegrationsDetailSync: Story = {
  name: "Intégrations — Détail Sync",
  render: () => <WireframeIframe file="admin-integrations-notion-3" />,
};

export const AdminIntegrationsWizardDark: Story = {
  name: "Intégrations — Wizard Dark",
  render: () => <WireframeIframe file="admin-integrations-notion-5" />,
};

export const AdminIntegrationsListeSync: Story = {
  name: "Intégrations — Liste Sync",
  render: () => <WireframeIframe file="admin-integrations-notion-6" />,
};

export const AdminJournalAudit: Story = {
  name: "Journal d'Audit",
  render: () => <WireframeIframe file="admin-journal-audit-1" />,
};

export const AdminLayoutSidebar: Story = {
  name: "Layout Sidebar (Ref)",
  render: () => <WireframeIframe file="admin-layout-sidebar-light" />,
};

export const AdminMembresListe: Story = {
  name: "Membres & Invitations — Liste",
  render: () => <WireframeIframe file="admin-membres-invitations-1" />,
};

export const AdminMembresVue2: Story = {
  name: "Membres & Invitations — Vue 2",
  render: () => <WireframeIframe file="admin-membres-invitations-3" />,
};

// — Board —

export const BoardLayout3Colonnes: Story = {
  name: "Board — Layout 3 Colonnes",
  render: () => <WireframeIframe file="board-3-column-layout-light" />,
};

export const BoardModalPost: Story = {
  name: "Board — Modal Post",
  render: () => <WireframeIframe file="board-modal-dark" />,
};

export const BoardLayoutSidebar: Story = {
  name: "Board — Layout avec Sidebar",
  render: () => <WireframeIframe file="board-sidebar-layout-light" />,
};

// — Detail —

export const DetailPostFullPage: Story = {
  name: "Detail — Post Full Page",
  render: () => <WireframeIframe file="detail-page-inline-action-dark-variant" />,
};

export const DetailPostModal: Story = {
  name: "Detail — Post Modal",
  render: () => <WireframeIframe file="detail-page-inline-actions-light" />,
};

// — Pages —

export const Embeds: Story = {
  name: "Configuration Embeds",
  render: () => <WireframeIframe file="embed" />,
};

export const HeaderFooter: Story = {
  name: "Header & Footer",
  render: () => <WireframeIframe file="header-footer-tenant-light" />,
};

export const Kanban: Story = {
  name: "Vue Kanban",
  render: () => <WireframeIframe file="kanban-light" />,
};

export const LandingDark: Story = {
  render: () => <WireframeIframe file="landing-dark" />,
};

export const LandingLight: Story = {
  render: () => <WireframeIframe file="landing-light" />,
};

export const LoginPage: Story = {
  name: "Login",
  render: () => <WireframeIframe file="login-tenant-light" />,
};

export const ModerationVue1: Story = {
  name: "Modération — Vue 1",
  render: () => <WireframeIframe file="moderation-1" />,
};

export const ModerationVue2: Story = {
  name: "Modération — Vue 2",
  render: () => <WireframeIframe file="moderation-2" />,
};

export const Profil: Story = {
  name: "Profil Utilisateur",
  render: () => <WireframeIframe file="profil" />,
};
