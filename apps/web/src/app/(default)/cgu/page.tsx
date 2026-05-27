import { type Metadata } from "next";
import Link from "next/link";

import { config } from "@/config";

import { sharedMetadata } from "../../shared-metadata";

const title = "Conditions générales d'utilisation et de vente";
const description = "Conditions générales d'utilisation et de vente du service";
const url = "/cgu";

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

const CguPage = () => {
  const brandName = config.brand.name;
  const contactEmail = config.legal.contactEmail;
  const publisherName = config.legal.publisherName;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_p+p]:mt-3 [&_p]:text-sm/relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-sm">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales d&apos;utilisation et de vente (ci-après « CGU/CGV ») régissent
        l&apos;utilisation du service {brandName} (ci-après « le Service ») édité par {publisherName}.
      </p>
      <p>
        Toute création de compte ou souscription à un abonnement implique l&apos;acceptation sans réserve des présentes
        CGU/CGV.
      </p>

      <h2>2. Description du service</h2>
      <p>
        {brandName} est une plateforme de collecte de feedback utilisateurs permettant de piloter la feuille de route
        d&apos;un produit. Le Service propose la création d&apos;espaces de travail, la soumission de posts, le vote,
        les commentaires, et l&apos;intégration avec des outils tiers.
      </p>

      <h2>3. Inscription et compte</h2>
      <p>
        L&apos;inscription au Service nécessite la fourniture d&apos;un nom, d&apos;une adresse email valide, et
        d&apos;un mot de passe. L&apos;utilisateur est responsable de la confidentialité de ses identifiants.
      </p>
      <p>
        La vérification de l&apos;adresse email est requise avant toute connexion par mot de passe. Le mot de passe est
        stocké de manière sécurisée (hashage irréversible).
      </p>
      <p>
        L&apos;utilisateur peut également se connecter via un lien magique (passwordless), un fournisseur OAuth (GitHub,
        Google, ProConnect), ou l&apos;Espace Membre beta.gouv.fr selon la configuration de l&apos;espace.
      </p>

      <h2>4. Formules et tarification</h2>
      <p>Le Service propose les formules suivantes :</p>
      <ul>
        <li>
          <strong>Gratuit</strong> - Fonctionnalités de base (roadmap, tableaux, votes, commentaires, intégration
          iframe, stockage d&apos;images, authentification).
        </li>
        <li>
          <strong>Add-ons à la carte</strong> - Fonctionnalités avancées activables individuellement ou en packs
          (domaine personnalisé, multi-tenant, intégrations, API, audit, SSO, analytics). Facturation mensuelle ou
          annuelle.
        </li>
        <li>
          <strong>Pack Pro</strong> - Tous les add-ons sauf SSO Entreprise, à prix réduit.
        </li>
        <li>
          <strong>Pack Complet</strong> - Tous les add-ons inclus, y compris SSO Entreprise.
        </li>
        <li>
          <strong>Administration publique</strong> - Accès complet gratuit pour les entités disposant d&apos;un domaine
          .gouv.fr vérifié.
        </li>
      </ul>
      <p>Les prix sont indiqués en euros TTC. TVA non applicable, article 293 B du Code Général des Impôts.</p>
      <p>
        Les tarifs en vigueur sont disponibles sur la page <Link href="/pricing">Tarifs</Link>.
      </p>

      <h2>5. Paiement et facturation</h2>
      <p>
        Le paiement est effectué par carte bancaire via la plateforme sécurisée{" "}
        <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">
          Stripe
        </a>
        . {brandName} ne stocke aucune donnée bancaire - celles-ci sont traitées exclusivement par Stripe.
      </p>
      <p>
        Les abonnements sont renouvelés automatiquement à chaque échéance (mensuelle ou annuelle). L&apos;utilisateur
        peut gérer son abonnement (modification, résiliation) depuis la page Facturation de son organisation.
      </p>
      <p>
        En cas d&apos;échec de paiement, Stripe procède à des tentatives de recouvrement automatiques. Si toutes les
        tentatives échouent, l&apos;abonnement est automatiquement résilié et les fonctionnalités associées sont
        désactivées.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique
        pas aux services pleinement exécutés avant la fin du délai de rétractation dont l&apos;exécution a commencé avec
        l&apos;accord du consommateur.
      </p>
      <p>
        L&apos;utilisateur peut résilier son abonnement à tout moment. La résiliation prend effet à la fin de la période
        de facturation en cours. Aucun remboursement prorata n&apos;est effectué.
      </p>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Le code source de {brandName} est distribué sous triple licence : AGPL v3 (fonctionnalités core), BSL 1.1
        (fonctionnalités EE), et Gov License (composants DSFR). Les détails sont disponibles dans le fichier
        LICENSING.md du dépôt.
      </p>
      <p>
        Les contenus publiés par les utilisateurs (posts, commentaires, votes) restent la propriété de leurs auteurs.
        L&apos;utilisateur accorde à {brandName} une licence d&apos;utilisation non exclusive pour l&apos;affichage et
        le traitement de ces contenus dans le cadre du Service.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        {brandName} s&apos;engage à mettre en œuvre les moyens nécessaires pour assurer la disponibilité et la sécurité
        du Service. Toutefois, {brandName} ne saurait être tenu responsable des interruptions, erreurs, ou pertes de
        données résultant de circonstances hors de son contrôle.
      </p>
      <p>
        L&apos;utilisateur est responsable des contenus qu&apos;il publie et s&apos;engage à ne pas publier de contenus
        illicites, diffamatoires, ou portant atteinte aux droits de tiers.
      </p>

      <h2>9. Protection des données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>10. Modification des conditions</h2>
      <p>
        {brandName} se réserve le droit de modifier les présentes CGU/CGV. Les utilisateurs seront informés par email
        des modifications substantielles au moins 30 jours avant leur entrée en vigueur. La poursuite de
        l&apos;utilisation du Service après cette date vaut acceptation des nouvelles conditions.
      </p>

      <h2>11. Résiliation</h2>
      <p>
        L&apos;utilisateur peut supprimer son compte à tout moment depuis son Profil. La suppression entraîne la perte
        définitive de l&apos;accès au Service. Les contributions (posts, commentaires) peuvent être conservées de
        manière anonyme.
      </p>
      <p>
        {brandName} se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes conditions,
        après notification à l&apos;utilisateur.
      </p>

      <h2>12. Droit applicable et juridiction</h2>
      <p>
        Les présentes conditions sont régies par le droit français. En cas de litige, et après tentative de résolution
        amiable, les tribunaux compétents seront ceux du ressort du siège social de l&apos;éditeur.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions, contactez-nous à{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <p className="mt-12 text-xs text-muted-foreground">Dernière mise à jour : avril 2026</p>
    </div>
  );
};

export default CguPage;
