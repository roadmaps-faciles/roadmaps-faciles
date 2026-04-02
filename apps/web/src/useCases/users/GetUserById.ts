import { z } from "zod";

import { User, type User as UserModel } from "@/lib/model/User";
import { type IUserRepo } from "@/lib/repo/IUserRepo";

import { type UseCase } from "../types";

export const GetUserByIdInput = z.object({ id: z.string() });
export type GetUserByIdInput = z.infer<typeof GetUserByIdInput>;
export type GetUserByIdOutput = null | UserModel;

export class GetUserById implements UseCase<GetUserByIdInput, GetUserByIdOutput> {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const user = await this.userRepo.findById(input.id);
    return user ? User.parse(user) : null;
  }
}
