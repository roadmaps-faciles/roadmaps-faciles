import { type Metadata } from "next";

import { config } from "@/config";
import { FooterConsentManagementItem } from "@/consentManagement";

import { sharedMetadata } from "../../shared-metadata";

const title = "Politique de confidentialité";
const description = "Politique de confidentialité et gestion des cookies";
const url = "/politique-de-confidentialite";

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

const PolitiqueDeConfidentialitePage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_p+p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-sm">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      <h2>Responsable du traitement</h2>
      <p>Le responsable du traitement des données personnelles est {config.legal.publisherName}.</p>

      <h2>Données collectées</h2>
      <p>{config.brand.name} collecte les données suivantes :</p>
      <ul>
        <li>
          <strong>Données d&apos;identification</strong> : nom, adresse e-mail (lors de la création de compte)
        </li>
        <li>
          <strong>Mot de passe</strong> : stocké sous forme de hash irréversible (algorithme argon2). Le mot de passe en
          clair n&apos;est jamais conservé.
        </li>
        <li>
          <strong>Données de connexion</strong> : logs de connexion, adresse IP, méthode d&apos;authentification
        </li>
        <li>
          <strong>Données d&apos;usage</strong> : contributions, votes, commentaires
        </li>
        <li>
          <strong>Données de facturation</strong> : les informations de paiement (numéro de carte, adresse de
          facturation) sont collectées et traitées exclusivement par notre prestataire de paiement Stripe, Inc.{" "}
          {config.brand.name} ne stocke aucune donnée bancaire.
        </li>
      </ul>

      <h2>Finalités du traitement</h2>
      <p>Les données personnelles sont traitées pour :</p>
      <ul>
        <li>Gérer votre compte utilisateur et votre authentification</li>
        <li>Permettre la publication de contributions et de votes</li>
        <li>Administrer les espaces de feedback</li>
        <li>Envoyer des notifications par email (si activées)</li>
        <li>Assurer la sécurité et le bon fonctionnement du service</li>
        <li>Traiter les paiements et gérer les abonnements</li>
      </ul>

      <h2>Sous-traitants</h2>
      <p>Les données personnelles peuvent être transmises aux sous-traitants suivants :</p>
      <ul>
        <li>
          <strong>Stripe, Inc.</strong> — Traitement des paiements et gestion des abonnements.{" "}
          <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">
            Politique de confidentialité Stripe
          </a>
        </li>
        <li>
          <strong>{config.legal.hostingName}</strong> — Hébergement de l&apos;infrastructure
        </li>
      </ul>

      <h2>Base légale</h2>
      <p>
        Le traitement est fondé sur le consentement de l&apos;utilisateur (article 6.1.a du RGPD) lors de la création de
        compte, et sur l&apos;intérêt légitime (article 6.1.f) pour la sécurité du service.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées pendant la durée d&apos;utilisation du service. En cas de suppression de compte, les
        données personnelles sont supprimées dans un délai de 30 jours. Les logs de connexion sont conservés 12 mois.
      </p>

      <h2>Cookies</h2>
      <p>Ce site utilise les cookies suivants :</p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-semibold">Cookie</th>
              <th className="p-2 text-left font-semibold">Catégorie</th>
              <th className="p-2 text-left font-semibold">Durée</th>
              <th className="p-2 text-left font-semibold">Finalité</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">
                <code>authjs.session-token</code>
              </td>
              <td className="p-2">Session utilisateur</td>
              <td className="p-2">Session</td>
              <td className="p-2">Authentification et maintien de la session</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">
                <code>NEXT_LOCALE</code>
              </td>
              <td className="p-2">Préférence de langue</td>
              <td className="p-2">1 an</td>
              <td className="p-2">Mémoriser la langue choisie</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">
                <code>anon_id</code>
              </td>
              <td className="p-2">Identification anonyme</td>
              <td className="p-2">1 an</td>
              <td className="p-2">Identifier les contributions anonymes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Vous pouvez gérer vos préférences de cookies à tout moment :{" "}
        <span className="inline-block">
          <FooterConsentManagementItem />
        </span>
      </p>

      <h2>Sous-traitants</h2>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-semibold">Sous-traitant</th>
              <th className="p-2 text-left font-semibold">Pays</th>
              <th className="p-2 text-left font-semibold">Service</th>
              <th className="p-2 text-left font-semibold">Politique</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">{config.legal.hostingName}</td>
              <td className="p-2">France</td>
              <td className="p-2">Hébergement</td>
              <td className="p-2">
                {config.legal.hostingPrivacyUrl ? (
                  <a href={config.legal.hostingPrivacyUrl} target="_blank" rel="noreferrer">
                    Voir
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, limitation,
        opposition et portabilité de vos données. Vous pouvez exercer ces droits en nous contactant à{" "}
        <a href={`mailto:${config.legal.rgpdEmail}`}>{config.legal.rgpdEmail}</a>.
      </p>
      <p>
        En cas de difficulté, vous pouvez introduire une réclamation auprès de la CNIL :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
          www.cnil.fr
        </a>
      </p>
    </div>
  );
};

export default PolitiqueDeConfidentialitePage;
