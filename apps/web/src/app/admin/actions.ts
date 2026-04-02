"use server";

import { userRepo } from "@/lib/repo";
import { type UserEmailSearchResult } from "@/lib/repo/IUserRepo";
import { assertAdmin } from "@/utils/auth";

export const searchUsers = async (query: string): Promise<UserEmailSearchResult[]> => {
  await assertAdmin();
  const trimmed = query.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return [];
  return userRepo.searchByEmail(trimmed);
};
