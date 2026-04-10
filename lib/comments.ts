import { createClient } from "@/lib/supabase/server";

export type CommentItem = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  author_name: string | null;
  author_email: string | null;
};

type BoardCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function getCommentsByPostId(postId: string): Promise<CommentItem[]> {
  const supabase = await createClient();

  const { data: comments, error: commentsError } = await supabase
    .from("board_comments")
    .select("id, post_id, author_id, content, created_at, updated_at, parent_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(`댓글 조회 실패: ${commentsError.message}`);
  }

  const commentList = (comments ?? []) as BoardCommentRow[];

  const authorIds = [...new Set(commentList.map((comment) => comment.author_id))];

  let profileMap: Record<string, ProfileRow> = {};

  if (authorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", authorIds);

    if (profilesError) {
      throw new Error(`댓글 작성자 조회 실패: ${profilesError.message}`);
    }

    profileMap = ((profiles ?? []) as ProfileRow[]).reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, ProfileRow>
    );
  }

  return commentList.map((comment) => ({
    ...comment,
    author_name: profileMap[comment.author_id]?.name ?? null,
    author_email: profileMap[comment.author_id]?.email ?? null,
  }));
}