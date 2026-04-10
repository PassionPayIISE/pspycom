// src/application/use-cases/admin/ApproveMemberUseCase.ts
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class ApproveMemberUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId.trim()) {
      throw new Error("승인할 사용자 id가 없습니다.");
    }

    await this.userRepository.approveMember(userId);
  }
}