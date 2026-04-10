import { CommentItemDto } from "@/application/dto/board/CommentItemDto";
import { BoardComment } from "@/domain/entities/BoardComment";

export interface ICommentRepository {
  findByPostId(postId: string): Promise<CommentItemDto[]>;
  findEntityById(commentId: string): Promise<BoardComment | null>;
  hasChildren(commentId: string): Promise<boolean>;
  create(input: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }): Promise<void>;
  softDelete(commentId: string): Promise<void>;
  delete(commentId: string): Promise<void>;
  findParentId(commentId: string): Promise<string | null>;
}