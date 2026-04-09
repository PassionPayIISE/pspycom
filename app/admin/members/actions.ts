"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, role, approved, is_active")
    .eq("id", user.id)
    .single();

  if (meError || !me) {
    throw new Error("내 회원 정보를 확인할 수 없습니다.");
  }

  if (me.role !== "admin" || me.approved !== true || me.is_active === false) {
    throw new Error("관리자 권한이 없습니다.");
  }

  return user;
}

export async function approveMember(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    throw new Error("userId가 비어 있습니다.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      approved: true,
      role: "member",
      is_active: true,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`승인 처리 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function revokeApproval(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    throw new Error("userId가 비어 있습니다.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      approved: false,
      role: "pending",
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`승인 취소 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function deactivateMember(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    throw new Error("userId가 비어 있습니다.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      is_active: false,
      role: "banned",
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`비활성화 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function activateMember(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    throw new Error("userId가 비어 있습니다.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      is_active: true,
      role: "member",
      approved: true,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`활성화 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}