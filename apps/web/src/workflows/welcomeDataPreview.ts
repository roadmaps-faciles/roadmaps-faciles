export const WELCOME_DATA_PREVIEW = {
  boards: [
    { name: "Feature Requests", description: "Tableau pour les demandes de fonctionnalités" },
    { name: "Bug Reports", description: "Tableau pour les rapports de bogues" },
  ],
  statuses: [
    { name: "Planifié", color: "blueCumulus" },
    { name: "En cours", color: "purpleGlycine" },
    { name: "Complété", color: "greenMenthe" },
    { name: "Rejeté", color: "error" },
  ],
  extras: "2 posts d'exemple, 1 commentaire, 1 épingle",
} as const;
