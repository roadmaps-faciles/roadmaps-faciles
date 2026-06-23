/**
 * Instrumentation temporaire du flow d'authentification (espace-membre + tenant).
 * Empreintes structurelles PII-safe : jamais la valeur brute d'un email/username/token.
 * À SUPPRIMER avant tout merge : branche de debug pour un AccessDenied reproductible
 * uniquement sur l'environnement de prod.
 */

/**
 * Empreinte d'une chaîne sans révéler son contenu : longueur + 2 premiers/2 derniers chars
 * + drapeaux qui trahissent un input mal formé (espace, majuscule, `@`, `%` d'un double-encodage).
 */
const dbgStr = (value: unknown): string => {
  if (value === null || value === undefined) return `<${String(value)}>`;
  if (typeof value !== "string") return `<${typeof value}>`;
  if (value === "") return "<empty>";
  const head = value.slice(0, 2);
  const tail = value.length > 5 ? value.slice(-2) : "";
  return `"${head}…${tail}" len=${value.length} at=${value.includes("@")} sp=${/\s/.test(value)} up=${/[A-Z]/.test(value)} pct=${value.includes("%")}`;
};

/** Masque la partie locale d'un email mais garde le domaine. */
const dbgEmail = (value: unknown): string => {
  if (typeof value !== "string" || !value) return `<${String(value)}>`;
  const at = value.indexOf("@");
  if (at === -1) return `${value[0] ?? ""}*** (no-@ len=${value.length})`;
  return `${value[0] ?? ""}***@${value.slice(at + 1)}`;
};

/** Redacte un message d'erreur : masque les emails et l'identifiant en fin de "nom d'utilisateur X". */
const dbgRedact = (message: unknown): string => {
  if (typeof message !== "string") return `<${String(message)}>`;
  return message
    .replace(/[\w.+-]+@[\w.-]+/g, match => `${match[0]}***@${match.split("@")[1] ?? ""}`)
    .replace(/(utilisateur\s+)(\S+)/gi, (_match, prefix: string, id: string) => `${prefix}${dbgStr(id)}`);
};

const authDebug = (tag: string, data: Record<string, unknown>): void => {
  console.error("[AUTH-DEBUG]", tag, JSON.stringify(data));
};

export { authDebug, dbgEmail, dbgRedact, dbgStr };
