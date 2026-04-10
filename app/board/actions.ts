"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";

type CreateCommentInput = {
  postId: string;
  postSlug: string;
  content: string;
  parentId?: string | null;
};

export async function createComment({
  postId,
  postSlug,
  content,
  parentId = null,
}: CreateCommentInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("댓글 내용을 입력하세요.");
  }

  if (trimmedContent.length > 1000) {
    throw new Error("댓글은 1000자 이하로 작성하세요.");
  }

  if (parentId) {
    const { data: parentComment, error: parentError } = await supabase
      .from("board_comments")
      .select("id, post_id, parent_id")
      .eq("id", parentId)
      .maybeSingle();

    if (parentError || !parentComment) {
      throw new Error("원본 댓글을 찾을 수 없습니다.");
    }

    if (parentComment.post_id !== postId) {
      throw new Error("잘못된 답글 요청입니다.");
    }

    if (parentComment.parent_id) {
      throw new Error("답글에는 다시 답글을 달 수 없습니다.");
    }
  }

  const { error } = await supabase.from("board_comments").insert({
    post_id: postId,
    author_id: user.id,
    content: trimmedContent,
    parent_id: parentId,
  });

  if (error) {
    throw new Error(`댓글 작성 실패: ${error.message}`);
  }

  revalidatePath(`/board/${postSlug}`);
}

export async function deleteComment(commentId: string, postSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: comment, error: fetchError } = await supabase
    .from("board_comments")
    .select("id, author_id")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError || !comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  if (comment.author_id !== user.id) {
    throw new Error("본인 댓글만 삭제할 수 있습니다.");
  }

  const { error } = await supabase
    .from("board_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(`댓글 삭제 실패: ${error.message}`);
  }

  revalidatePath(`/board/${postSlug}`);
}