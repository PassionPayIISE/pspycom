import { NoticeDto } from "@/application/dto/notice/NoticeDto";
import { INoticeRepository } from "@/domain/repositories/INoticeRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

type NoticeRow = {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  pinned: boolean;
  visibility: "public" | "member" | "private";
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseNoticeRepository implements INoticeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findPublishedNotices(): Promise<NoticeDto[]> {
    const { data, error } = await this.supabase
      .from("notices")
      .select(
        "id, title, slug, content, published, pinned, visibility, author_id, created_at, updated_at"
      )
      .eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`공지 목록 조회 실패: ${error.message}`);
    }

    return (data ?? []) as NoticeDto[];
  }

  async findPublishedBySlug(slug: string): Promise<NoticeDto | null> {
    const normalizedSlug = decodeURIComponent(slug);

    const { data, error } = await this.supabase
      .from("notices")
      .select(
        "id, title, slug, content, published, pinned, visibility, author_id, created_at, updated_at"
      )
      .eq("slug", normalizedSlug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      throw new Error(`공지 상세 조회 실패: ${error.message}`);
    }

    return (data as NoticeDto | null) ?? null;
  }
}
