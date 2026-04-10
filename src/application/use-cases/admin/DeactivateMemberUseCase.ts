// src/application/use-cases/admin/DeactivateMemberUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class DeactivateMemberUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId.trim()) {
      throw new Error("비활성화할 사용자 id가 없습니다.");
    }

    await this.userRepository.deactivateMember(userId);
  }
}