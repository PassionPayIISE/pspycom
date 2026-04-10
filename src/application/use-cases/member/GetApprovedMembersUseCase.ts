// src/application/use-cases/member/GetApprovedMembersUseCase.ts
import { MemberSummaryDto } from "@/application/dto/member/MemberSummaryDto";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class GetApprovedMembersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<MemberSummaryDto[]> {
    return this.userRepository.findActiveMembers();
  }
}