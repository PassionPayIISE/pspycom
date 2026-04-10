import { ICommentRepository } from "@/domain/repositories/ICommentRepository";

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findEntityById(commentId);

    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    if (!comment.canDelete(userId)) {
      throw new Error("본인 댓글만 삭제할 수 있습니다.");
    }

    const parentId = comment.parentId;
    const hasChildren = await this.commentRepository.hasChildren(commentId);

    if (hasChildren) {
      await this.commentRepository.softDelete(commentId);
      return;
    }

    await this.commentRepository.delete(commentId);

    if (parentId) {
      await this.pruneDeletedAncestors(parentId);
    }
  }

  private async pruneDeletedAncestors(commentId: string): Promise<void> {
    const comment = await this.commentRepository.findEntityById(commentId);

    if (!comment) {
      return;
    }

    const hasChildren = await this.commentRepository.hasChildren(commentId);

    if (hasChildren) {
      return;
    }

    if (!comment.isDeleted()) {
      return;
    }

    const parentId = comment.parentId;

    await this.commentRepository.delete(commentId);

    if (parentId) {
      await this.pruneDeletedAncestors(parentId);
    }
  }
}