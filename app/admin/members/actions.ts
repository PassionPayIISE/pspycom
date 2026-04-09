"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminProfileRow = {
  id: string;
  role: "pending" | "member" | "admin" | "banned";
  approved: boolean;
  is_active: boolean | null;
};

async function requireAdmin() {
  const supabase = await createServerClient();

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
    .single<AdminProfileRow>();

  if (meError || !me) {
    throw new Error("관리자 정보를 확인할 수 없습니다.");
  }

  if (me.role !== "admin" || me.approved !== true || me.is_active === false) {
    throw new Error("관리자 권한이 없습니다.");
  }

  return user;
}

export async function approveMember(targetUserId: string) {
  if (!targetUserId) {
    throw new Error("대상 회원 ID가 없습니다.");
  }

  await requireAdmin();

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      role: "member",
      approved: true,
      is_active: true,
    })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(`승인 처리 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function rejectMember(targetUserId: string) {
  if (!targetUserId) {
    throw new Error("대상 회원 ID가 없습니다.");
  }

  await requireAdmin();

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      role: "banned",
      approved: false,
      is_active: false,
    })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(`거절 처리 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function promoteToAdmin(targetUserId: string) {
  if (!targetUserId) {
    throw new Error("대상 회원 ID가 없습니다.");
  }

  await requireAdmin();

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      role: "admin",
      approved: true,
      is_active: true,
    })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(`관리자 승격 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}

export async function demoteAdminToMember(targetUserId: string) {
  if (!targetUserId) {
    throw new Error("대상 회원 ID가 없습니다.");
  }

  await requireAdmin();

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      role: "member",
      approved: true,
      is_active: true,
    })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(`관리자 해제 실패: ${error.message}`);
  }

  revalidatePath("/admin/members");
}