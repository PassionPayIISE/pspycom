// app/board/new/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createBoardContainer } from "@/container/board.container";

export async function createBoardPostAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

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

  const { createBoardPostUseCase } = await createBoardContainer();
  const post = await createBoardPostUseCase.execute({
    title,
    content,
    authorId: user.id,
  });

  redirect(`/board/${encodeURIComponent(post.slug)}`);
}