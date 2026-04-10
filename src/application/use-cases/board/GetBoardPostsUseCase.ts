// src/application/use-cases/board/GetBoardPostsUseCase.ts
import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";

export class GetBoardPostsUseCase {
  constructor(private readonly boardRepository: IBoardRepository) {}

  async execute(): Promise<BoardPost[]> {
    return this.boardRepository.findAll();
  }
}