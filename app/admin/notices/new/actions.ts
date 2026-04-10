"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";

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

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string
) {
  const baseSlug = slugify(title) || "notice";
  let finalSlug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from("notices")
      .select("id")
      .eq("slug", finalSlug)
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

export async function createNoticeAction(formData: FormData) {
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
    throw new Error("관리자만 공지를 작성할 수 있습니다.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visibilityRaw = String(formData.get("visibility") ?? "public").trim();
  const published = formData.get("published") === "on";
  const pinned = formData.get("pinned") === "on";

  if (!title) {
    throw new Error("제목을 입력하세요.");
  }

  if (!content) {
    throw new Error("내용을 입력하세요.");
  }

  if (!isValidVisibility(visibilityRaw)) {
    throw new Error("공개 범위 값이 올바르지 않습니다.");
  }

  const slug = await generateUniqueSlug(supabase, title);

  const { error: insertError } = await supabase.from("notices").insert({
    title,
    slug,
    content,
    visibility: visibilityRaw,
    published,
    pinned,
    author_id: user.id,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  redirect("/notice");
}