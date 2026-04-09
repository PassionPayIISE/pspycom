"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileRole = "pending" | "member" | "admin" | "banned";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile, error } = await supabase
    .from("profiles")
    .select("id, role, approved")
    .eq("id", user.id)
    .single();

  if (error || !myProfile) {
    redirect("/");
  }

  if (myProfile.role !== "admin" || myProfile.approved !== true) {
    redirect("/");
  }

  return { supabase, user };
}

async function updateMemberRole(params: {
  id: string;
  role: ProfileRole;
  approved: boolean;
  is_active?: boolean;
  deleted_at?: string | null;
}) {
  const { supabase } = await requireAdmin();

  const payload: {
    role: ProfileRole;
    approved: boolean;
    updated_at: string;
    is_active?: boolean;
    deleted_at?: string | null;
  } = {
    role: params.role,
    approved: params.approved,
    updated_at: new Date().toISOString(),
  };

  if (typeof params.is_active === "boolean") {
    payload.is_active = params.is_active;
  }

  if (params.deleted_at !== undefined) {
    payload.deleted_at = params.deleted_at;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", params.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}

export async function approveMemberAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  await updateMemberRole({
    id,
    role: "member",
    approved: true,
    is_active: true,
    deleted_at: null,
  });
}

export async function rejectMemberAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  await updateMemberRole({
    id,
    role: "pending",
    approved: false,
    is_active: true,
    deleted_at: null,
  });
}

export async function makeAdminAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  await updateMemberRole({
    id,
    role: "admin",
    approved: true,
    is_active: true,
    deleted_at: null,
  });
}

export async function revokeToMemberAction(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  if (id === user.id) {
    throw new Error("자기 자신은 일반회원으로 변경할 수 없습니다.");
  }

  await updateMemberRole({
    id,
    role: "member",
    approved: true,
    is_active: true,
    deleted_at: null,
  });
}

export async function kickMemberAction(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("회원 ID가 없습니다.");
  }

  if (id === user.id) {
    throw new Error("자기 자신은 추방할 수 없습니다.");
  }

  await updateMemberRole({
    id,
    role: "banned",
    approved: false,
    is_active: false,
    deleted_at: new Date().toISOString(),
  });
}