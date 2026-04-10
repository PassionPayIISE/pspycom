// app/board/[slug]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { createCommentContainer } from "@/container/comment.container";
import { createBoardContainer } from "@/container/board.container";

function decodeSlug(slug: string) {
  return decodeURIComponent(slug);
}

export async function createCommentAction(formData: FormData) {
  const rawSlug = String(formData.get("slug") ?? "");
  const slug = decodeSlug(rawSlug);
  const content = String(formData.get("content") ?? "").trim();
  const parentIdValue = String(formData.get("parentId") ?? "").trim();
  const parentId = parentIdValue ? parentIdValue : null;

  if (!slug) {
    throw new Error("slug가 없습니다.");
  }

  if (!content) {
    throw new Error("댓글 내용을 입력하세요.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { getBoardPostDetailUseCase } = await createBoardContainer();
  const post = await getBoardPostDetailUseCase.execute(slug);

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  const { createCommentUseCase } = await createCommentContainer();
  await createCommentUseCase.execute({
    postId: post.id,
    authorId: user.id,
    content,
    parentId,
  });

  revalidatePath(`/board/${encodeURIComponent(post.slug)}`);
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = decodeSlug(rawSlug);

  if (!commentId) {
    throw new Error("댓글 id가 없습니다.");
  }

  if (!slug) {
    throw new Error("slug가 없습니다.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { deleteCommentUseCase } = await createCommentContainer();
  await deleteCommentUseCase.execute(commentId, user.id);

  revalidatePath(`/board/${encodeURIComponent(slug)}`);
}