import { CommentItemDto } from "@/application/dto/board/CommentItemDto";
import { BoardComment } from "@/domain/entities/BoardComment";

export interface ICommentRepository {
  findByPostId(postId: string): Promise<CommentItemDto[]>;
  findEntityById(commentId: string): Promise<BoardComment | null>;
  create(input: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }): Promise<void>;
  delete(commentId: string): Promise<void>;
}
