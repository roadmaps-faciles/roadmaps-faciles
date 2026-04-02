import "server-only";
import argon2 from "argon2";

export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./passwordConstants";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
