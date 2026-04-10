// app/admin/members/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAuthContainer } from "@/container/auth.container";
import { createAdminContainer } from "@/container/admin.container";
import { ProfileRole } from "@/domain/entities/UserProfile";

async function requireAdmin() {
  const { requireAdminUserUseCase } = await createAuthContainer();
  const result = await requireAdminUserUseCase.execute();

  if (!result.ok) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  return result;
}

export async function approveMemberAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const { approveMemberUseCase } = await createAdminContainer();
  await approveMemberUseCase.execute(userId);

  revalidatePath("/admin/members");
}

export async function deactivateMemberAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const { deactivateMemberUseCase } = await createAdminContainer();
  await deactivateMemberUseCase.execute(userId);

  revalidatePath("/admin/members");
}

export async function activateMemberAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const { activateMemberUseCase } = await createAdminContainer();
  await activateMemberUseCase.execute(userId);

  revalidatePath("/admin/members");
}

export async function changeRoleAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as ProfileRole;

  const { changeRoleUseCase } = await createAdminContainer();
  await changeRoleUseCase.execute(userId, role);

  revalidatePath("/admin/members");
}