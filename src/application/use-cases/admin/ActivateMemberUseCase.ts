// src/application/use-cases/admin/ActivateMemberUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class ActivateMemberUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId.trim()) {
      throw new Error("활성화할 사용자 id가 없습니다.");
    }

    await this.userRepository.activateMember(userId);
  }
}