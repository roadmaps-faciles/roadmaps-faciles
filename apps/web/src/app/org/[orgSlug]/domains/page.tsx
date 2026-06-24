import { notFound } from "next/navigation";

// Feature "domaines d'organisation" désactivée (dormante). La preuve de propriété d'un customDomain
// se fait désormais au niveau tenant (vérif TXT, cf. VerifyTenantCustomDomain). Le reste de la
// machinerie (OrgDomainsList, use cases AddOrgDomain/VerifyOrgDomain/RemoveOrgDomain, orgDomainRepo,
// cron) est conservé pour un réveil futur façon "org domains" GitHub. Réveil = restaurer ce fichier
// + l'entrée nav dans OrgAdminSideMenu.
const OrgDomainsPage = () => {
  notFound();
};

export default OrgDomainsPage;
