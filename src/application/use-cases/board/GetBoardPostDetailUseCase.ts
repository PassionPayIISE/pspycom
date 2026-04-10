// src/application/use-cases/board/GetBoardPostDetailUseCase.ts
import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";

export class GetBoardPostDetailUseCase {
  constructor(private readonly boardRepository: IBoardRepository) {}

  async execute(slug: string): Promise<BoardPost | null> {
    return this.boardRepository.findBySlug(slug);
  }
}