// src/application/use-cases/auth/GetCurrentUserProfileUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { UserProfile } from "@/domain/entities/UserProfile";

export class GetCurrentUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<{
    user: { id: string } | null;
    profile: UserProfile | null;
  }> {
    const user = await this.userRepository.getCurrentAuthUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const profile = await this.userRepository.findProfileById(user.id);

    return { user, profile };
  }
}