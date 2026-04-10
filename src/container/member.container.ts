// src/container/member.container.ts
import { createClient } from "@/infrastructure/supabase/server";
import { GetApprovedMembersUseCase } from "@/application/use-cases/member/GetApprovedMembersUseCase";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";

export async function createMemberContainer() {
  const supabase = await createClient();
  const userRepository = new SupabaseUserRepository(supabase);

  return {
    getApprovedMembersUseCase: new GetApprovedMembersUseCase(userRepository),
  };
}