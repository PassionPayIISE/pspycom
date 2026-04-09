"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type NoticeVisibility = "public" | "member" | "private";

function isValidVisibility(value: string): value is NoticeVisibility {
  return value === "public" || value === "member" || value === "private";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  if (profileError || !profile || profile.role !== "admin" || profile.approved !== true) {
    throw new Error("관리자만 접근할 수 있습니다.");
  }

  return { supabase, user };
}

async function generateUniqueSlugExcludingCurrent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  currentId: string
) {
  const baseSlug = slugify(title) || "notice";
  let finalSlug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from("notices")
      .select("id")
      .eq("slug", finalSlug)
      .neq("id", currentId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return finalSlug;
    }

    finalSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function updateNoticeAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visibilityRaw = String(formData.get("visibility") ?? "public").trim();
  const published = formData.get("published") === "on";
  const pinned = formData.get("pinned") === "on";
  const regenerateSlug = formData.get("regenerateSlug") === "on";

  if (!id) {
    throw new Error("공지 ID가 없습니다.");
  }

  if (!title) {
    throw new Error("제목을 입력하세요.");
  }

  if (!content) {
    throw new Error("내용을 입력하세요.");
  }

  if (!isValidVisibility(visibilityRaw)) {
    throw new Error("공개 범위 값이 올바르지 않습니다.");
  }

  const updatePayload: Record<string, unknown> = {
    title,
    content,
    visibility: visibilityRaw,
    published,
    pinned,
    updated_at: new Date().toISOString(),
  };

  if (regenerateSlug) {
    updatePayload.slug = await generateUniqueSlugExcludingCurrent(supabase, title, id);
  }

  const { error } = await supabase.from("notices").update(updatePayload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notice");
  revalidatePath(`/notice`);
  revalidatePath("/admin/notices");
  redirect("/admin/notices");
}