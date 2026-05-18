import { z } from "zod";

import { type IUserRepo } from "@/lib/repo/IUserRepo";
import { hashPassword } from "@/lib/utils/password";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/utils/passwordConstants";
import { createEmailVerificationToken } from "@/lib/utils/verificationToken";

import { type UseCase } from "../types";

export const SignupWithPasswordInput = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export type SignupWithPasswordInput = z.infer<typeof SignupWithPasswordInput>;

export interface SignupWithPasswordOutput {
  userId: string;
  verificationTokenRaw: string;
}

export class SignupWithPassword implements UseCase<SignupWithPasswordInput, SignupWithPasswordOutput> {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: SignupWithPasswordInput): Promise<SignupWithPasswordOutput> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
      // emailVerified intentionally null - must verify via email link
    });

    const { raw } = await createEmailVerificationToken(input.email);

    return { userId: user.id, verificationTokenRaw: raw };
  }
}
