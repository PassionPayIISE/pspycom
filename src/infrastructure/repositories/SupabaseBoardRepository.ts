import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";
import { SupabaseClient } from "@supabase/supabase-js";

type BoardPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
};

export class SupabaseBoardRepository implements IBoardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getAuthorNameMap(authorIds: string[]): Promise<Map<string, string | null>> {
    const uniqueAuthorIds = [...new Set(authorIds)].filter(Boolean);

    if (uniqueAuthorIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, name")
      .in("id", uniqueAuthorIds);

    if (error) {
      throw new Error(`작성자 정보 조회 실패: ${error.message}`);
    }

    return new Map(
      ((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile.name ?? null])
    );
  }

  async findAll(): Promise<BoardPost[]> {
    const { data, error } = await this.supabase
      .from("board_posts")
      .select("id, title, slug, content, author_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`게시글 목록 조회 실패: ${error.message}`);
    }

    const rows = (data ?? []) as BoardPostRow[];
    const authorNameMap = await this.getAuthorNameMap(rows.map((row) => row.author_id));

    return rows.map(
      (row) =>
        new BoardPost(
          row.id,
          row.title,
          row.slug,
          row.content,
          row.author_id,
          authorNameMap.get(row.author_id) ?? null,
          row.created_at,
          row.updated_at
        )
    );
  }

  async findBySlug(slug: string): Promise<BoardPost | null> {
    const normalizedSlug = decodeURIComponent(slug);

    const { data, error } = await this.supabase
      .from("board_posts")
      .select("id, title, slug, content, author_id, created_at, updated_at")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (error) {
      throw new Error(`게시글 상세 조회 실패: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const row = data as BoardPostRow;

    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("name")
      .eq("id", row.author_id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`작성자 정보 조회 실패: ${profileError.message}`);
    }

    return new BoardPost(
      row.id,
      row.title,
      row.slug,
      row.content,
      row.author_id,
      (profile as { name: string | null } | null)?.name ?? null,
      row.created_at,
      row.updated_at
    );
  }

  async save(post: BoardPost): Promise<void> {
    const { error } = await this.supabase.from("board_posts").upsert({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      author_id: post.authorId,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    });

    if (error) {
      throw new Error(`게시글 저장 실패: ${error.message}`);
    }
  }

  async delete(postId: string): Promise<void> {
    const { error } = await this.supabase
      .from("board_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      throw new Error(`게시글 삭제 실패: ${error.message}`);
    }
  }
}