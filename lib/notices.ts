import { createClient } from "@/lib/supabase/server";

export type NoticeVisibility = "public" | "member" | "private";

export interface Notice {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  pinned: boolean;
  visibility: NoticeVisibility;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAllNotices(): Promise<Notice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select(
      "id, title, slug, content, published, pinned, visibility, author_id, created_at, updated_at"
    )
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllNotices] error:", error);
    return [];
  }

  return (data ?? []) as Notice[];
}

export async function getNoticeBySlug(slug: string): Promise<Notice | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select(
      "id, title, slug, content, published, pinned, visibility, author_id, created_at, updated_at"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("[getNoticeBySlug] error:", error);
    return null;
  }

  return data as Notice;
}