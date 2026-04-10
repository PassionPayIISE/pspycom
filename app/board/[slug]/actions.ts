"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "로그인 후 댓글을 작성할 수 있습니다." };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!postId) {
    return { error: "게시글 정보가 올바르지 않습니다." };
  }

  if (!content) {
    return { error: "댓글 내용을 입력하세요." };
  }

  if (content.length > 1000) {
    return { error: "댓글은 1000자 이하로 입력하세요." };
  }

  const { error } = await supabase.from("board_comments").insert({
    post_id: postId,
    author_id: user.id,
    content,
  });

  if (error) {
    return { error: "댓글 작성에 실패했습니다." };
  }

  const { data: post } = await supabase
    .from("board_posts")
    .select("slug")
    .eq("id", postId)
    .single();

  if (post?.slug) {
    revalidatePath(`/board/${post.slug}`);
  }

  return { success: true };
}

export async function deleteComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "로그인 정보가 없습니다." };
  }

  const commentId = String(formData.get("commentId") ?? "").trim();
  const postSlug = String(formData.get("postSlug") ?? "").trim();

  if (!commentId || !postSlug) {
    return { error: "요청 정보가 올바르지 않습니다." };
  }

  const { error } = await supabase
    .from("board_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) {
    return { error: "댓글 삭제에 실패했습니다." };
  }

  revalidatePath(`/board/${postSlug}`);

  return { success: true };
}