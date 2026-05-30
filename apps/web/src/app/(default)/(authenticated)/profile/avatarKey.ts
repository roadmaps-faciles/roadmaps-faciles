/**
 * `image` est stocké en `/api/uploads/<key>` quand le user uploade chez nous,
 * ou en URL absolue externe (avatar EM, OAuth provider). On ne supprime que les
 * uploads internes (préfixés par `/api/uploads/avatars/<userId>/`).
 *
 * Helper pur isolé dans son propre module : ne peut pas vivre dans `actions.ts`
 * ("use server" n'autorise que des exports de fonctions async).
 */
export const extractOwnedAvatarKey = (imageUrl: null | string | undefined, userId: string): null | string => {
  if (!imageUrl) return null;
  const prefix = `/api/uploads/avatars/${userId}/`;
  return imageUrl.startsWith(prefix) ? imageUrl.replace(/^\/api\/uploads\//, "") : null;
};
