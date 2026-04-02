/**
 * Password validation constants — safe to import from both server and client code.
 * The actual hashing functions remain in `password.ts` (server-only).
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
