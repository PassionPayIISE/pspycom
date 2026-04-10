import { SupabaseClient } from "@supabase/supabase-js";
import { BoardComment } from "@/domain/entities/BoardComment";
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";
import { CommentItemDto } from "@/application/dto/board/CommentItemDto";

type BoardCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  deleted_at: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
};

export class SupabaseCommentRepository implements ICommentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByPostId(postId: string): Promise<CommentItemDto[]> {
    const { data: comments, error: commentsError } = await this.supabase
      .from("board_comments")
      .select("id, post_id, author_id, content, created_at, updated_at, parent_id, deleted_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      throw new Error(`댓글 조회 실패: ${commentsError.message}`);
    }

    const commentList = (comments ?? []) as BoardCommentRow[];
    const authorIds = [...new Set(commentList.map((c) => c.author_id))];
    let profileMap: Record<string, ProfileRow> = {};

    if (authorIds.length > 0) {
      const { data: profiles, error: profilesError } = await this.supabase
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
      id: comment.id,
      post_id: comment.post_id,
      author_id: comment.author_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_id: comment.parent_id,
      deleted_at: comment.deleted_at,
      author_name: profileMap[comment.author_id]?.name ?? null,
      author_email: profileMap[comment.author_id]?.email ?? null,
    }));
  }

  async findEntityById(commentId: string): Promise<BoardComment | null> {
    const { data, error } = await this.supabase
      .from("board_comments")
      .select("id, post_id, author_id, content, created_at, updated_at, parent_id, deleted_at")
      .eq("id", commentId)
      .maybeSingle();

    if (error) {
      throw new Error(`댓글 단건 조회 실패: ${error.message}`);
    }

    if (!data) return null;

    const row = data as BoardCommentRow;

    return new BoardComment(
      row.id,
      row.post_id,
      row.author_id,
      row.content,
      row.created_at,
      row.updated_at,
      row.parent_id,
      row.deleted_at
    );
  }

  async hasChildren(commentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("board_comments")
      .select("id")
      .eq("parent_id", commentId);

    if (error) {
      throw new Error(`답댓 존재 여부 확인 실패: ${error.message}`);
    }

    return (data ?? []).length > 0;
  }

  async create(input: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }): Promise<void> {
    const { error } = await this.supabase.from("board_comments").insert({
      post_id: input.postId,
      author_id: input.authorId,
      content: input.content.trim(),
      parent_id: input.parentId ?? null,
    });

    if (error) {
      throw new Error(`댓글 생성 실패: ${error.message}`);
    }
  }

  async softDelete(commentId: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from("board_comments")
      .update({
        content: "삭제된 댓글입니다.",
        updated_at: now,
        deleted_at: now,
      })
      .eq("id", commentId);

    if (error) {
      throw new Error(`댓글 소프트 삭제 실패: ${error.message}`);
    }
  }

  async delete(commentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("board_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      throw new Error(`댓글 삭제 실패: ${error.message}`);
    }
  }

  async findParentId(commentId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("board_comments")
      .select("parent_id")
      .eq("id", commentId)
      .maybeSingle();

    if (error) {
      throw new Error(`부모 댓글 조회 실패: ${error.message}`);
    }

    if (!data) return null;

    return (data as { parent_id: string | null }).parent_id;
  }
}
