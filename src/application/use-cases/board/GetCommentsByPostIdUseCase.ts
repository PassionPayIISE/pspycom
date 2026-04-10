// src/application/use-cases/board/GetCommentsByPostIdUseCase.ts
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";
import { CommentItemDto } from "@/application/dto/board/CommentItemDto";

export class GetCommentsByPostIdUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(postId: string): Promise<CommentItemDto[]> {
    return this.commentRepository.findByPostId(postId);
  }
}