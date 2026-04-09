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

export async function deleteNoticeAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("공지 ID가 없습니다.");
  }

  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notice");
  revalidatePath("/admin/notices");
}