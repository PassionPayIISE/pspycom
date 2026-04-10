// src/application/use-cases/board/DeleteCommentUseCase.ts
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(commentId: string, currentUserId: string): Promise<void> {
    const comment = await this.commentRepository.findEntityById(commentId);

    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    if (!comment.canDelete(currentUserId)) {
      throw new Error("댓글 삭제 권한이 없습니다.");
    }

    await this.commentRepository.delete(commentId);
  }
}