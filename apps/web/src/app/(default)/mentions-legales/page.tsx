import { type Metadata } from "next";
import Link from "next/link";

import { config } from "@/config";

import { sharedMetadata } from "../../shared-metadata";

const title = "Mentions légales";
const description = "Mentions légales du site";
const url = "/mentions-legales";

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

const MentionsLegalesPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_p+p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-sm">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>{config.brand.name}</strong> ({config.host}) est édité par {config.legal.publisherName}.
      </p>
      {config.legal.publisherAddress && <p>{config.legal.publisherAddress}</p>}

      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est {config.legal.publicationDirector}.</p>

      <h2>Hébergement</h2>
      <p>
        Ce site est hébergé par :
        <br />
        {config.legal.hostingName}
        <br />
        {config.legal.hostingAddress}
        <br />
        <a href={`mailto:${config.legal.hostingContact}`}>{config.legal.hostingContact}</a>
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question, vous pouvez nous contacter à :{" "}
        <a href={`mailto:${config.legal.contactEmail}`}>{config.legal.contactEmail}</a>
      </p>

      <h2>Code source</h2>
      <p>
        Le code source de ce site est disponible sous licence open source :{" "}
        <a href={`${config.repositoryUrl}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
          voir la licence
        </a>
      </p>

      <h2>Politique de confidentialité</h2>
      <p>
        Consultez notre <Link href="/politique-de-confidentialite">politique de confidentialité</Link> pour en savoir
        plus sur la gestion de vos données personnelles.
      </p>
    </div>
  );
};

export default MentionsLegalesPage;
