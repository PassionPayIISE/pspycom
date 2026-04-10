// src/application/use-cases/admin/ChangeRoleUseCase.ts
import { ProfileRole } from "@/domain/entities/UserProfile";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class ChangeRoleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, role: ProfileRole): Promise<void> {
    if (!userId.trim()) {
      throw new Error("권한을 변경할 사용자 id가 없습니다.");
    }

    await this.userRepository.changeRole(userId, role);
  }
}