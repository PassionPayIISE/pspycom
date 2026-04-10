import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => any;
    upsert: (values: Record<string, unknown>) => any;
    delete: () => any;
  };
};

type BoardPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export class SupabaseBoardRepository implements IBoardRepository {
  constructor(private readonly supabase: SupabaseLike) {}

  async findAll(): Promise<BoardPost[]> {
    const { data, error } = await this.supabase
      .from("board_posts")
      .select("id, title, slug, content, author_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`게시글 목록 조회 실패: ${error.message}`);
    }

    return ((data ?? []) as BoardPostRow[]).map(
      (row) =>
        new BoardPost(
          row.id,
          row.title,
          row.slug,
          row.content,
          row.author_id,
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

  return new BoardPost(
    data.id,
    data.title,
    data.slug,
    data.content,
    data.author_id,
    data.created_at,
    data.updated_at
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