import { createClient } from "@/lib/supabase/server";

export type BoardComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_profile: {
    name: string | null;
    email: string | null;
  } | null;
};

type RawBoardCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_profile:
    | {
        name: string | null;
        email: string | null;
      }
    | {
        name: string | null;
        email: string | null;
      }[]
    | null;
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
      author_profile:profiles!board_comments_author_id_fkey (
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

  const rows = (data ?? []) as RawBoardCommentRow[];

  return rows.map((row) => {
    const profile = Array.isArray(row.author_profile)
      ? row.author_profile[0] ?? null
      : row.author_profile;

    return {
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_profile: profile,
    };
  });
}