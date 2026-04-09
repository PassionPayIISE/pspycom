import { createClient } from "@/lib/supabase/server";

export type BoardPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export async function getBoardPosts(): Promise<BoardPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, slug, content, author_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BoardPost[];
}

export async function getBoardPostBySlug(slug: string): Promise<BoardPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, slug, content, author_id, created_at, updated_at")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data as BoardPost;
}