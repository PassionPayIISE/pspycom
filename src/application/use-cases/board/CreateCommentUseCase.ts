// src/application/use-cases/board/CreateCommentUseCase.ts
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";

type CreateCommentInput = {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
};

export class CreateCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: CreateCommentInput): Promise<void> {
    const trimmed = input.content.trim();

    if (!trimmed) {
      throw new Error("댓글 내용은 비어 있을 수 없습니다.");
    }

    await this.commentRepository.create({
      ...input,
      content: trimmed,
    });
  }
}