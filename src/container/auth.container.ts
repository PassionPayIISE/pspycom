// src/container/auth.container.ts
import { createClient } from "@/infrastructure/supabase/server";
import { GetCurrentUserProfileUseCase } from "@/application/use-cases/auth/GetCurrentUserProfileUseCase";
import { RequireApprovedUserUseCase } from "@/application/use-cases/auth/RequireApprovedUserUseCase";
import { RequireAdminUserUseCase } from "@/application/use-cases/auth/RequireAdminUserUseCase";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";

export async function createAuthContainer() {
  const supabase = await createClient();
  const userRepository = new SupabaseUserRepository(supabase);

  return {
    getCurrentUserProfileUseCase: new GetCurrentUserProfileUseCase(userRepository),
    requireApprovedUserUseCase: new RequireApprovedUserUseCase(userRepository),
    requireAdminUserUseCase: new RequireAdminUserUseCase(userRepository),
  };
}