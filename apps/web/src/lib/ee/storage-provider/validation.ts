/**
 * Layout des assets en S3, par type :
 *
 *   images/{uuid}.{ext}                      markdown embed (post, comment)
 *   avatars/{userId}/{uuid}.{ext}            avatar utilisateur
 *   tenants/{tenantId}/{logo|banner}.{ext}   assets tenant (logo, banner)
 *   tenants/{tenantId}/images/{uuid}.{ext}   legacy (pré-refactor, lecture seule)
 *
 * Les UUID v4 sont globally uniques, donc les images markdown n'ont pas besoin de
 * scoping tenant. Avatars et assets tenants gardent un scoping owner pour la gestion
 * des permissions (suppression, override) côté repo/service.
 *
 * Quand on ajoute un nouveau type d'asset, ajouter son pattern ici.
 */
const PATTERNS: readonly RegExp[] = [
  /^images\/[\w-]+\.\w+$/,
  // userId est un CUID (alphanumérique), pas un int auto-increment.
  /^avatars\/[\w-]+\/[\w-]+\.\w+$/,
  /^tenants\/\d+\/(logo|banner)(-[\w-]+)?\.\w+$/,
  /^tenants\/\d+\/images\/[\w-]+\.\w+$/,
];

export function isValidStorageKey(key: string): boolean {
  return PATTERNS.some(p => p.test(key));
}

/**
 * Construit les paths S3 par type d'asset. Utilisé par les server actions d'upload
 * pour garantir un layout cohérent avec la regex de validation.
 */
export const storagePaths = {
  /** Image embed dans markdown (post, comment). Pas de scoping : UUID globally unique. */
  image: (uuid: string, ext: string): string => `images/${uuid}.${ext}`,
  /** Avatar utilisateur. Scoping user pour permissions (suppression/override). */
  avatar: (userId: number | string, uuid: string, ext: string): string => `avatars/${userId}/${uuid}.${ext}`,
  /** Asset tenant (logo, banner). Singleton par type, ou suffix custom. */
  tenantAsset: (tenantId: number | string, type: "banner" | "logo", ext: string, suffix?: string): string =>
    `tenants/${tenantId}/${type}${suffix ? `-${suffix}` : ""}.${ext}`,
};
