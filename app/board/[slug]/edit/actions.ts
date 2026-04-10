// app/board/[slug]/edit/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createBoardContainer } from "@/container/board.container";

function decodeSlug(slug: string) {
  return decodeURIComponent(slug);
}

export async function updateBoardPostAction(formData: FormData) {
  const rawSlug = String(formData.get("slug") ?? "");
  const slug = decodeSlug(rawSlug);
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!slug) {
    throw new Error("slug가 없습니다.");
  }

  if (!title) {
    throw new Error("제목을 입력하세요.");
  }

  if (!content) {
    throw new Error("내용을 입력하세요.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { updateBoardPostUseCase } = await createBoardContainer();
  const post = await updateBoardPostUseCase.execute({
    slug,
    currentUserId: user.id,
    title,
    content,
  });

  redirect(`/board/${encodeURIComponent(post.slug)}`);
}