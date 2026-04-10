import { createClient } from "@/lib/supabase/server";

export type BoardComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string | null;
    email: string | null;
  } | null;
};

export async function getCommentsByPostId(postId: string): Promise<BoardComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_comments")
    .select(`
      id,
      post_id,
      author_id,
      content,
      created_at,
      updated_at,
      profiles:author_id (
        name,
        email
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("댓글 조회 실패:", error.message);
    return [];
  }

  return (data ?? []) as BoardComment[];
}