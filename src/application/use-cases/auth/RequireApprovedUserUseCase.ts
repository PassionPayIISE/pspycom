// src/application/use-cases/auth/RequireApprovedUserUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { UserProfile } from "@/domain/entities/UserProfile";

export type RequireApprovedUserResult =
  | {
      ok: true;
      user: { id: string };
      profile: UserProfile;
    }
  | {
      ok: false;
      redirectTo: "/login" | "/blocked" | "/pending";
    };

export class RequireApprovedUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<RequireApprovedUserResult> {
    const user = await this.userRepository.getCurrentAuthUser();

    if (!user) {
      return { ok: false, redirectTo: "/login" };
    }

    const profile = await this.userRepository.findProfileById(user.id);

    if (!profile) {
      return { ok: false, redirectTo: "/login" };
    }

    if (profile.isBlocked()) {
      return { ok: false, redirectTo: "/blocked" };
    }

    if (!profile.isApproved()) {
      return { ok: false, redirectTo: "/pending" };
    }

    return {
      ok: true,
      user,
      profile,
    };
  }
}