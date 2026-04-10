// src/domain/repositories/IUserRepository.ts
import { MemberSummaryDto } from "@/application/dto/member/MemberSummaryDto";
import { UserProfile, ProfileRole } from "@/domain/entities/UserProfile";

export interface IUserRepository {
  findActiveMembers(): Promise<MemberSummaryDto[]>;
  getCurrentAuthUser(): Promise<{ id: string } | null>;
  findProfileById(userId: string): Promise<UserProfile | null>;

  approveMember(userId: string): Promise<void>;
  deactivateMember(userId: string): Promise<void>;
  activateMember(userId: string): Promise<void>;
  changeRole(userId: string, role: ProfileRole): Promise<void>;
}