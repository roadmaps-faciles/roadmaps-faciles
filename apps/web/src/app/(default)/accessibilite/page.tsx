import { type Metadata } from "next";

import { sharedMetadata } from "../../shared-metadata";

const title = "Déclaration d'accessibilité";
const description = "Déclaration d'accessibilité du site";
const url = "/accessibilite";

export const metadata: Metadata = {
  ...sharedMetadata,
  title,
  description,
  openGraph: {
    ...sharedMetadata.openGraph,
    title,
    description,
    url,
  },
  alternates: {
    canonical: url,
  },
};

const AccessibilitePage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold">{title}</h1>
      <p className="mb-4 text-lg text-muted-foreground">
        Cette page sera complétée prochainement avec la déclaration d'accessibilité conforme au RGAA.
      </p>
      <p>
        État de conformité : <strong>non conforme</strong>. Un audit d'accessibilité est prévu.
      </p>
    </div>
  );
};

export default AccessibilitePage;
