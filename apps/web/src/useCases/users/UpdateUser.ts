import { z } from "zod";

import { User, type User as UserModel } from "@/lib/model/User";
import { type IUserRepo } from "@/lib/repo/IUserRepo";

import { type UseCase } from "../types";

export const UpdateUserInput = z.object({
  id: z.string(),
  data: User.partial().omit({ id: true }),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;
export type UpdateUserOutput = UserModel;

export class UpdateUser implements UseCase<UpdateUserInput, UpdateUserOutput> {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepo.update(input.id, input.data);
    return User.parse(user);
  }
}
