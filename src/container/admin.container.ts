// src/container/admin.container.ts
import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";
import { ApproveMemberUseCase } from "@/application/use-cases/admin/ApproveMemberUseCase";
import { DeactivateMemberUseCase } from "@/application/use-cases/admin/DeactivateMemberUseCase";
import { ActivateMemberUseCase } from "@/application/use-cases/admin/ActivateMemberUseCase";
import { ChangeRoleUseCase } from "@/application/use-cases/admin/ChangeRoleUseCase";
import { InviteMemberUseCase } from "@/application/use-cases/admin/InviteMemberUseCase";

export async function createAdminContainer() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  const userRepository = new SupabaseUserRepository(supabase);

  return {
    approveMemberUseCase: new ApproveMemberUseCase(userRepository),
    deactivateMemberUseCase: new DeactivateMemberUseCase(userRepository),
    activateMemberUseCase: new ActivateMemberUseCase(userRepository),
    changeRoleUseCase: new ChangeRoleUseCase(userRepository),
    inviteMemberUseCase: new InviteMemberUseCase(supabaseAdmin),
  };
}