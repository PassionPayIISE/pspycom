"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin" ||
    profile.approved !== true
  ) {
    throw new Error("관리자만 접근할 수 있습니다.");
  }

  return { supabase, user };
}

export async function approveMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "member",
      approved: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}

export async function rejectMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "pending",
      approved: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}

export async function makeAdminAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  if (id === user.id) {
    throw new Error("현재 로그인한 관리자 본인은 다시 승격할 필요가 없습니다.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "admin",
      approved: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}

export async function revokeToMemberAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  if (id === user.id) {
    throw new Error("현재 로그인한 관리자 본인은 일반회원으로 내릴 수 없습니다.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "member",
      approved: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}