import { type z } from "zod";

import { User, type User as UserModel } from "@/lib/model/User";
import { type IUserRepo } from "@/lib/repo/IUserRepo";

import { type UseCase } from "../types";

export const CreateUserInput = User.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateUserInput = z.infer<typeof CreateUserInput>;
export type CreateUserOutput = UserModel;

export class CreateUser implements UseCase<CreateUserInput, CreateUserOutput> {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const user = await this.userRepo.create(input);
    return User.parse(user);
  }
}
