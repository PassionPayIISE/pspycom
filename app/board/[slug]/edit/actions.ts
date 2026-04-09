"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireLoggedInUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  return { supabase, user };
}

async function canManagePost(postAuthorId: string, currentUserId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (postAuthorId === currentUserId) {
    return true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUserId)
    .single();

  return profile?.role === "admin";
}

async function generateUniqueSlugExcludingCurrent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  currentId: string
) {
  const baseSlug = slugify(title) || "post";
  let finalSlug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from("board_posts")
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

export async function updateBoardPostAction(formData: FormData) {
  const { supabase, user } = await requireLoggedInUser();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const regenerateSlug = formData.get("regenerateSlug") === "on";

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  if (!title) {
    throw new Error("제목을 입력하세요.");
  }

  if (!content) {
    throw new Error("내용을 입력하세요.");
  }

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("id, author_id")
    .eq("id", id)
    .single();

  if (postError || !post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  const allowed = await canManagePost(post.author_id, user.id, supabase);

  if (!allowed) {
    throw new Error("수정 권한이 없습니다.");
  }

  const payload: Record<string, unknown> = {
    title,
    content,
    updated_at: new Date().toISOString(),
  };

  if (regenerateSlug) {
    payload.slug = await generateUniqueSlugExcludingCurrent(supabase, title, id);
  }

  const { data: updated, error } = await supabase
    .from("board_posts")
    .update(payload)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/board");
  revalidatePath(`/board/${updated.slug}`);
  redirect(`/board/${updated.slug}`);
}

export async function deleteBoardPostByIdAction(formData: FormData) {
  const { supabase, user } = await requireLoggedInUser();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("id, author_id, slug")
    .eq("id", id)
    .single();

  if (postError || !post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  const allowed = await canManagePost(post.author_id, user.id, supabase);

  if (!allowed) {
    throw new Error("삭제 권한이 없습니다.");
  }

  const { error } = await supabase.from("board_posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/board");
  revalidatePath(`/board/${post.slug}`);
  redirect("/board");
}