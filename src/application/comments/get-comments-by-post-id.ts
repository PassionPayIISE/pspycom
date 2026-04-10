import { createClient } from "@/infrastructure/supabase/server";
import type { CommentRow } from "@/types/comment";

type RawCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function getCommentsByPostId(postId: string): Promise<CommentRow[]> {
  const supabase = await createClient();

  const { data: comments, error: commentsError } = await supabase
    .from("board_comments")
    .select("id, post_id, author_id, parent_id, content, created_at, updated_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  const typedComments = (comments ?? []) as RawCommentRow[];
  const authorIds = [...new Set(typedComments.map((comment) => comment.author_id))];

  let profileMap = new Map<string, ProfileRow>();

  if (authorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", authorIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    );
  }

  return typedComments.map((comment) => {
    const profile = profileMap.get(comment.author_id);

    return {
      ...comment,
      author: profile
        ? {
            id: profile.id,
            name: profile.name,
            email: profile.email,
          }
        : null,
    };
  });
}