import { z } from "zod";

import { User, type User as UserModel } from "@/lib/model/User";
import { type IUserRepo } from "@/lib/repo/IUserRepo";

import { type UseCase } from "../types";

export const GetUserByEmailInput = z.object({ email: z.string().email() });
export type GetUserByEmailInput = z.infer<typeof GetUserByEmailInput>;
export type GetUserByEmailOutput = null | UserModel;

export class GetUserByEmail implements UseCase<GetUserByEmailInput, GetUserByEmailOutput> {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: GetUserByEmailInput): Promise<GetUserByEmailOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    return user ? User.parse(user) : null;
  }
}
