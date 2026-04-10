// src/application/use-cases/auth/RequireAdminUserUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { UserProfile } from "@/domain/entities/UserProfile";

export type RequireAdminUserResult =
  | {
      ok: true;
      user: { id: string };
      profile: UserProfile;
    }
  | {
      ok: false;
      redirectTo: "/login" | "/blocked" | "/pending" | "/";
    };

export class RequireAdminUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<RequireAdminUserResult> {
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

    if (!profile.isAdmin()) {
      return { ok: false, redirectTo: "/" };
    }

    return {
      ok: true,
      user,
      profile,
    };
  }
}